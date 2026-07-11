(function () {
  'use strict';

  const AI_SETTINGS_KEY = 'gm_ai_settings';

  function getCurrentImageRatioInfo() {
    const width = canvas.width || 1;
    const height = canvas.height || 1;
    const ratio = width / height;
    const bgWidth = bgImage ? (bgImage.naturalWidth || bgImage.width || 0) : 0;
    const bgHeight = bgImage ? (bgImage.naturalHeight || bgImage.height || 0) : 0;
    return {
      canvasWidth: width,
      canvasHeight: height,
      canvasAspectRatio: Number(ratio.toFixed(4)),
      canvasAspectRatioText: `${width}:${height}`,
      canvasAspectRatioReadable: `${ratio.toFixed(4)} (${ratio >= 1 ? '橫式' : '直式'})`,
      backgroundImageWidth: bgWidth,
      backgroundImageHeight: bgHeight,
      backgroundAspectRatio: bgWidth && bgHeight ? Number((bgWidth / bgHeight).toFixed(4)) : null
    };
  }

  function getAiLayerSnapshot(layer, index) {
    if (!layer) return null;
    return {
      id: layer.id,
      index: index + 1,
      text: layer.text,
      font: layer.font,
      size: layer.size,
      color: layer.color,
      strokeColor: layer.strokeColor,
      strokeWidth: layer.strokeWidth,
      stroke: !!layer.stroke,
      shadow: !!layer.shadow,
      x: layer.x,
      y: layer.y,
      visible: !!layer.visible
    };
  }

  function getAiContextSnapshot() {
    const ratio = getCurrentImageRatioInfo();
    const selectedIndex = activeLayerId ? layers.findIndex(layer => layer.id === activeLayerId) : -1;
    const selectedLayer = selectedIndex >= 0 ? getAiLayerSnapshot(layers[selectedIndex], selectedIndex) : null;
    return {
      canvas: ratio,
      layerCount: layers.length,
      activeLayerId,
      selectedLayer,
      layers: layers.map((layer, index) => getAiLayerSnapshot(layer, index)),
      defaultText: defaultNewTextValue,
      defaults: {
        font: lastUsedStyles.font,
        size: lastUsedStyles.size,
        color: lastUsedStyles.color,
        strokeColor: lastUsedStyles.strokeColor,
        strokeWidth: lastUsedStyles.strokeWidth,
        stroke: lastUsedStyles.stroke,
        shadow: lastUsedStyles.shadow
      },
      modes: {
        approvalMode: aiApprovalMode,
        apiFormat: aiApiFormat,
        featureEnabled: enableAiFeature
      }
    };
  }

  function buildAiSystemPrompt() {
    const customPrompt = (aiSystemPrompt || '').trim();
    const availableFonts = (typeof window.getAvailableFontValues === 'function'
      ? window.getAvailableFontValues()
      : (typeof CHINESE_FONTS !== 'undefined' ? CHINESE_FONTS.map(f => f.value) : []));
    const basePrompt = [
      '你是這個早安圖編輯器的操作助理。',
      '請根據使用者需求輸出嚴格 JSON，不要輸出 Markdown、程式碼區塊或額外說明文字。',
      'JSON 格式必須是 { "summary": string, "actions": [ ... ] }。',
      'actions 只允許使用 view_canvas, view_layer, add_layer, edit_layer, delete_layer, toggle_layer_visible。',
      'view_canvas 與 view_layer 不修改資料，只用來表達要查看的目標。',
      'add_layer 需要 text，並可選 x, y, font, size, color, strokeColor, strokeWidth, stroke, shadow, visible。',
      'edit_layer 需要 id，patch 為可更新欄位物件。',
      'delete_layer 需要 id。',
      'toggle_layer_visible 需要 id 與 visible 布林值。',
      '如果使用者沒有指定座標，新增文字預設放在畫布中央。',
      '需要考慮目前畫布比例與圖片長寬比，避免把內容放到畫布外。',
      '若要新增文字，請優先使用目前選取圖層的附近或畫布中央。',
      '回傳的 JSON 必須可以直接被 parse。',
      availableFonts.length > 0
        ? `可用字體值（font 欄位可填）：${availableFonts.join('、')}`
        : ''
    ].filter(Boolean).join(' ');
    return customPrompt ? `${basePrompt}\n\n使用者自訂系統提示詞：\n${customPrompt}` : basePrompt;
  }

  function normalizeAiTextResponse(raw) {
    if (raw == null) return '';
    if (typeof raw === 'string') return raw.trim();
    if (typeof raw === 'object') {
      if (typeof raw.output_text === 'string') return raw.output_text.trim();
      if (Array.isArray(raw.output)) {
        for (const block of raw.output) {
          if (Array.isArray(block.content)) {
            const text = block.content.map(item => item.text || '').join('');
            if (text.trim()) return text.trim();
          }
        }
      }
      if (Array.isArray(raw.choices) && raw.choices[0]?.message?.content) {
        const content = raw.choices[0].message.content;
        if (typeof content === 'string') return content.trim();
      }
    }
    return '';
  }

  function extractJsonFromAiText(text) {
    if (!text) return null;
    const cleaned = text.trim()
      .replace(/^```(?:json)?/i, '')
      .replace(/```$/i, '')
      .trim();

    try {
      return JSON.parse(cleaned);
    } catch (e) {
      const firstBrace = cleaned.indexOf('{');
      const lastBrace = cleaned.lastIndexOf('}');
      if (firstBrace >= 0 && lastBrace > firstBrace) {
        const candidate = cleaned.slice(firstBrace, lastBrace + 1);
        try {
          return JSON.parse(candidate);
        } catch (inner) { }
      }
    }
    return null;
  }

  function formatAiContextPreview() {
    const context = getAiContextSnapshot();
    const preview = {
      canvas: context.canvas,
      activeLayerId: context.activeLayerId,
      layerCount: context.layerCount,
      layers: context.layers.map(layer => ({
        id: layer.id,
        text: layer.text,
        size: layer.size,
        visible: layer.visible,
        x: Math.round(layer.x),
        y: Math.round(layer.y)
      })),
      modes: context.modes
    };
    return JSON.stringify(preview, null, 2);
  }

  function saveAiSettings() {
    const data = {
      enableAiFeature,
      aiApprovalMode,
      aiApiFormat,
      aiApiBaseUrl,
      aiApiKey,
      aiModel,
      aiSystemPrompt,
      aiMaxOutputTokens
    };
    localStorage.setItem(AI_SETTINGS_KEY, JSON.stringify(data));
  }

  function setAiEntrypointVisibility(isVisible) {
    const display = isVisible ? '' : 'none';
    const headerBtn = document.getElementById('headerAiBtn');
    const mobileBtn = document.querySelector('#mobileEditToolbar .mobile-edit-btn[title="AI 實驗功能"]');
    const mobileSheetItem = Array.from(document.querySelectorAll('#mobileMenuSheet .mobile-menu-sheet__item'))
      .find(btn => (btn.textContent || '').includes('AI 實驗功能'));
    if (headerBtn) headerBtn.style.display = display;
    if (mobileBtn) mobileBtn.style.display = display;
    if (mobileSheetItem) mobileSheetItem.style.display = display;
  }

  function syncAiSettingsUi() {
    const toggleEl = document.getElementById('toggleEnableAi');
    const badgeEl = document.getElementById('aiApprovalBadge');
    if (toggleEl) toggleEl.classList.toggle('on', enableAiFeature);
    if (badgeEl) {
      badgeEl.textContent = aiApprovalMode === 'auto' ? '自動批准' : '手動批准';
      badgeEl.style.background = aiApprovalMode === 'auto' ? 'rgba(77, 201, 143, 0.15)' : 'rgba(245,166,35,0.15)';
      badgeEl.style.borderColor = aiApprovalMode === 'auto' ? '#4dc98f' : 'var(--gold)';
      badgeEl.style.color = aiApprovalMode === 'auto' ? '#4dc98f' : 'var(--gold)';
    }

    setAiEntrypointVisibility(enableAiFeature);

    const baseUrlEl = document.getElementById('aiApiBaseUrl');
    const apiKeyEl = document.getElementById('aiApiKey');
    const modelEl = document.getElementById('aiModel');
    const formatEl = document.getElementById('aiApiFormat');
    const approvalEl = document.getElementById('aiApprovalMode');
    const maxTokensEl = document.getElementById('aiMaxOutputTokens');
    const promptEl = document.getElementById('aiSystemPrompt');
    if (baseUrlEl) baseUrlEl.value = aiApiBaseUrl;
    if (apiKeyEl) apiKeyEl.value = aiApiKey;
    if (modelEl) modelEl.value = aiModel;
    if (formatEl) formatEl.value = aiApiFormat;
    if (approvalEl) approvalEl.value = aiApprovalMode;
    if (maxTokensEl) maxTokensEl.value = aiMaxOutputTokens;
    if (promptEl) promptEl.value = aiSystemPrompt;

    refreshAiContextPreview();
  }

  function loadAiSettings() {
    try {
      const raw = localStorage.getItem(AI_SETTINGS_KEY);
      if (!raw) {
        syncAiSettingsUi();
        return;
      }
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object') {
        syncAiSettingsUi();
        return;
      }
      enableAiFeature = !!parsed.enableAiFeature;
      aiApprovalMode = parsed.aiApprovalMode === 'auto' ? 'auto' : 'manual';
      aiApiFormat = ['auto', 'responses', 'chat_completions'].includes(parsed.aiApiFormat) ? parsed.aiApiFormat : 'auto';
      aiApiBaseUrl = parsed.aiApiBaseUrl || aiApiBaseUrl;
      aiApiKey = parsed.aiApiKey || '';
      aiModel = parsed.aiModel || aiModel;
      aiSystemPrompt = parsed.aiSystemPrompt || '';
      aiMaxOutputTokens = Number.isFinite(+parsed.aiMaxOutputTokens) ? +parsed.aiMaxOutputTokens : aiMaxOutputTokens;
    } catch (e) {
      console.error('載入 AI 設定失敗', e);
    }
    syncAiSettingsUi();
  }

  function toggleAiFeatureRequest() {
    if (!enableAiFeature) {
      aiPendingEnable = true;
      aiPendingOpenAssistant = false;
      const modal = document.getElementById('aiWarningModal');
      if (modal) modal.classList.add('active');
      return;
    }
    enableAiFeature = false;
    syncAiSettingsUi();
    saveAiSettings();
    showToast('AI 實驗功能已關閉');
  }

  function confirmEnableAiFeature() {
    const shouldOpenAssistant = aiPendingOpenAssistant;
    aiPendingEnable = false;
    aiPendingOpenAssistant = false;
    enableAiFeature = true;
    const modal = document.getElementById('aiWarningModal');
    if (modal) modal.classList.remove('active');
    syncAiSettingsUi();
    saveAiSettings();
    showToast('AI 實驗功能已啟用');
    if (shouldOpenAssistant) {
      setTimeout(() => openAiAssistant(), 0);
    }
  }

  function cancelEnableAiFeature() {
    aiPendingEnable = false;
    aiPendingOpenAssistant = false;
    const modal = document.getElementById('aiWarningModal');
    if (modal) modal.classList.remove('active');
    syncAiSettingsUi();
  }

  function openAiAssistant() {
    if (!enableAiFeature) {
      aiPendingEnable = true;
      aiPendingOpenAssistant = true;
      const modal = document.getElementById('aiWarningModal');
      if (modal) modal.classList.add('active');
      return;
    }
    aiAssistantOpen = true;
    refreshAiContextPreview();
    const modal = document.getElementById('aiAssistantModal');
    if (modal) modal.classList.add('active');
  }

  function closeAiAssistant() {
    aiAssistantOpen = false;
    if (aiSpeechRecognizing) {
      stopAiSpeechRecognition();
    }
    const help = document.getElementById('aiSpeechHelp');
    if (help) help.style.display = 'none';
    const modal = document.getElementById('aiAssistantModal');
    if (modal) modal.classList.remove('active');
  }

  function refreshAiContextPreview() {
    const previewEl = document.getElementById('aiContextPreview');
    if (previewEl) {
      previewEl.textContent = formatAiContextPreview();
    }
  }

  function updateAiResponsePreview(text, status = '等待 AI 回應') {
    const statusEl = document.getElementById('aiResponseStatus');
    const previewEl = document.getElementById('aiResponsePreview');
    if (statusEl) statusEl.textContent = status;
    if (previewEl) previewEl.textContent = text || '';
  }

  function getAiConfigFromUi(syncUi = true) {
    const baseUrlEl = document.getElementById('aiApiBaseUrl');
    const apiKeyEl = document.getElementById('aiApiKey');
    const modelEl = document.getElementById('aiModel');
    const formatEl = document.getElementById('aiApiFormat');
    const approvalEl = document.getElementById('aiApprovalMode');
    const maxTokensEl = document.getElementById('aiMaxOutputTokens');
    const promptEl = document.getElementById('aiSystemPrompt');

    aiApiBaseUrl = (baseUrlEl?.value || aiApiBaseUrl || 'https://api.openai.com/v1').trim().replace(/\/+$/, '');
    aiApiKey = (apiKeyEl?.value || aiApiKey || '').trim();
    aiModel = (modelEl?.value || aiModel || '').trim() || 'gpt-4.1-mini';
    aiApiFormat = ['auto', 'responses', 'chat_completions'].includes(formatEl?.value) ? formatEl.value : 'auto';
    aiApprovalMode = approvalEl?.value === 'auto' ? 'auto' : 'manual';
    aiMaxOutputTokens = Math.max(64, Math.min(8192, parseInt(maxTokensEl?.value || aiMaxOutputTokens || 1024, 10) || 1024));
    aiSystemPrompt = promptEl?.value || '';
    saveAiSettings();
    if (syncUi) syncAiSettingsUi();
    return {
      baseUrl: aiApiBaseUrl,
      apiKey: aiApiKey,
      model: aiModel,
      format: aiApiFormat,
      approvalMode: aiApprovalMode,
      maxOutputTokens: aiMaxOutputTokens,
      systemPrompt: aiSystemPrompt
    };
  }

  function buildAiUserPrompt(userPrompt) {
    const context = getAiContextSnapshot();
    return [
      '以下是目前畫布的即時資料，請依照使用者要求產出 JSON 操作計畫。',
      `畫布比例：${context.canvas.canvasAspectRatioReadable}`,
      `畫布尺寸：${context.canvas.canvasWidth}x${context.canvas.canvasHeight}`,
      `背景圖片尺寸：${context.canvas.backgroundImageWidth || 'unknown'}x${context.canvas.backgroundImageHeight || 'unknown'}`,
      `目前圖層數：${context.layerCount}`,
      `目前選取圖層 ID：${context.activeLayerId ?? 'none'}`,
      `圖層清單：${JSON.stringify(context.layers)}`,
      `使用者需求：${userPrompt}`,
      '請直接回傳 JSON：{ "summary": "...", "actions": [ { "type": "...", ... } ] }'
    ].join('\n');
  }

  async function callAiEndpoint({ baseUrl, apiKey, model, format, maxOutputTokens, userPrompt }) {
    const headers = {
      'Content-Type': 'application/json'
    };
    if (apiKey) {
      headers.Authorization = `Bearer ${apiKey}`;
    }

    const messages = [
      { role: 'system', content: buildAiSystemPrompt() },
      { role: 'user', content: buildAiUserPrompt(userPrompt) }
    ];

    const payloadResponses = {
      model,
      input: messages.map(message => ({
        role: message.role,
        content: [{ type: 'input_text', text: message.content }]
      })),
      max_output_tokens: maxOutputTokens
    };

    const payloadChat = {
      model,
      messages,
      max_tokens: maxOutputTokens
    };

    const requestJson = async (url, body) => {
      const res = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(body)
      });
      const text = await res.text();
      let parsed = null;
      try { parsed = text ? JSON.parse(text) : null; } catch (e) { }
      if (!res.ok) {
        const errText = parsed?.error?.message || parsed?.message || text || `HTTP ${res.status}`;
        throw new Error(errText);
      }
      return parsed || text;
    };

    const base = baseUrl.replace(/\/+$/, '');
    if (format === 'responses') {
      const result = await requestJson(`${base}/responses`, payloadResponses);
      return normalizeAiTextResponse(result);
    }
    if (format === 'chat_completions') {
      const result = await requestJson(`${base}/chat/completions`, payloadChat);
      return normalizeAiTextResponse(result);
    }

    try {
      const result = await requestJson(`${base}/responses`, payloadResponses);
      return normalizeAiTextResponse(result);
    } catch (responsesErr) {
      const result = await requestJson(`${base}/chat/completions`, payloadChat);
      return normalizeAiTextResponse(result);
    }
  }

  function sanitizeAiLayerPatch(patch) {
    const allowed = ['text', 'font', 'size', 'color', 'strokeColor', 'strokeWidth', 'stroke', 'shadow', 'x', 'y', 'visible'];
    const output = {};
    if (!patch || typeof patch !== 'object') return output;
    for (const key of allowed) {
      if (Object.prototype.hasOwnProperty.call(patch, key)) {
        output[key] = patch[key];
      }
    }
    if (typeof output.size === 'number') {
      output.size = Math.max(10, Math.min(2000, Math.round(output.size)));
    }
    if (typeof output.strokeWidth === 'number') {
      output.strokeWidth = Math.max(0, Math.min(100, Math.round(output.strokeWidth)));
    }
    if (typeof output.x === 'number') output.x = Math.max(0, Math.min(canvas.width, output.x));
    if (typeof output.y === 'number') output.y = Math.max(0, Math.min(canvas.height, output.y));
    return output;
  }

  function resolveAiTargetLayer(action) {
    const targetId = action?.id ?? action?.layerId ?? (action?.target === 'selected' ? activeLayerId : null);
    if (targetId == null) return null;
    const id = Number(targetId);
    if (!Number.isFinite(id)) return null;
    return layers.find(layer => layer.id === id) || null;
  }

  function describeAiAction(action) {
    if (!action || typeof action !== 'object') return '無效動作';
    switch (action.type) {
      case 'view_canvas':
        return '查看目前畫布';
      case 'view_layer':
        return `查看圖層 ${action.id ?? action.layerId ?? 'selected'}`;
      case 'add_layer':
        return `新增文字：${String(action.text || '').slice(0, 20)}`;
      case 'edit_layer':
        return `編輯圖層 ${action.id ?? action.layerId ?? 'selected'}`;
      case 'delete_layer':
        return `刪除圖層 ${action.id ?? action.layerId ?? 'selected'}`;
      case 'toggle_layer_visible':
        return `切換圖層 ${action.id ?? action.layerId ?? 'selected'} 顯示`;
      default:
        return `未知動作：${action.type || 'unknown'}`;
    }
  }

  function summarizeAiActions(actions) {
    if (!Array.isArray(actions) || !actions.length) return 'AI 沒有產生任何動作。';
    return actions.map((action, index) => `${index + 1}. ${describeAiAction(action)}`).join('\n');
  }

  function applyAiActions(plan) {
    const actions = Array.isArray(plan?.actions) ? plan.actions : [];
    if (!actions.length) {
      showToast('AI 沒有回傳可執行的動作');
      return;
    }

    let mutated = false;
    let selectedLayer = null;
    const viewResults = [];

    for (const action of actions) {
      if (!action || typeof action !== 'object') continue;

      if (action.type === 'view_canvas') {
        viewResults.push({
          type: 'view_canvas',
          canvas: getCurrentImageRatioInfo(),
          layerCount: layers.length
        });
        continue;
      }

      if (action.type === 'view_layer') {
        selectedLayer = resolveAiTargetLayer(action);
        viewResults.push({
          type: 'view_layer',
          id: action.id ?? action.layerId ?? 'selected',
          layer: selectedLayer ? getAiLayerSnapshot(selectedLayer, layers.findIndex(layer => layer.id === selectedLayer.id)) : null
        });
        continue;
      }

      if (action.type === 'add_layer') {
        if (!mutated) {
          pushToUndo();
          mutated = true;
        }
        const newLayer = makeLayer(
          Number.isFinite(+action.x) ? +action.x : canvas.width / 2,
          Number.isFinite(+action.y) ? +action.y : canvas.height / 2
        );
        const addPatch = sanitizeAiLayerPatch(action);
        Object.assign(newLayer, addPatch);
        if (typeof action.text === 'string') newLayer.text = action.text;
        if (typeof action.font === 'string') newLayer.font = action.font;
        if (typeof action.visible === 'boolean') newLayer.visible = action.visible;
        layers.push(newLayer);
        activeLayerId = newLayer.id;
        selectedLayer = newLayer;
        continue;
      }

      if (action.type === 'edit_layer') {
        const layer = resolveAiTargetLayer(action);
        if (!layer) continue;
        if (!mutated) {
          pushToUndo();
          mutated = true;
        }
        const patch = sanitizeAiLayerPatch(action.patch || action);
        Object.assign(layer, patch);
        if (typeof action.text === 'string') layer.text = action.text;
        selectedLayer = layer;
        continue;
      }

      if (action.type === 'delete_layer') {
        const layer = resolveAiTargetLayer(action);
        if (!layer) continue;
        if (!mutated) {
          pushToUndo();
          mutated = true;
        }
        layers = layers.filter(item => item.id !== layer.id);
        if (activeLayerId === layer.id) {
          activeLayerId = layers.length ? layers[layers.length - 1].id : null;
        }
        continue;
      }

      if (action.type === 'toggle_layer_visible') {
        const layer = resolveAiTargetLayer(action);
        if (!layer) continue;
        if (!mutated) {
          pushToUndo();
          mutated = true;
        }
        layer.visible = typeof action.visible === 'boolean' ? action.visible : !layer.visible;
        selectedLayer = layer;
      }
    }

    renderLayersList();
    drawCanvas();
    saveSettings();
    updateHistoryButtons();
    updateExportButtonsState();
    if (viewResults.length) {
      updateAiResponsePreview(
        JSON.stringify({
          summary: plan.summary || 'AI 已執行',
          actions,
          views: viewResults
        }, null, 2),
        summarizeAiActions(actions)
      );
    }
    refreshAiContextPreview();
    saveAiSettings();
    showToast(`AI 已完成：${plan.summary || '操作完成'}`);
  }

  function updateAiResponseDisplay(text, summary, actions) {
    const preview = {
      summary: summary || 'AI 回應',
      actions: actions || []
    };
    updateAiResponsePreview(JSON.stringify(preview, null, 2), summarizeAiActions(actions));
  }

  async function runAiAssistant() {
    if (!enableAiFeature) {
      showToast('請先啟用 AI 實驗功能');
      return;
    }
    if (aiBusy) {
      showToast('AI 正在處理中，請稍候');
      return;
    }
    const cfg = getAiConfigFromUi();
    const promptEl = document.getElementById('aiPromptInput');
    const userPrompt = (promptEl?.value || '').trim();
    if (!userPrompt) {
      showToast('請先輸入 AI 需求描述');
      return;
    }
    if (!cfg.apiKey) {
      showToast('請先輸入 API Key');
      return;
    }
    if (!cfg.baseUrl) {
      showToast('請先輸入 API Base URL');
      return;
    }

    aiBusy = true;
    updateAiResponsePreview('正在與 AI 連線...', '請稍候');
    try {
      const rawText = await callAiEndpoint({
        baseUrl: cfg.baseUrl,
        apiKey: cfg.apiKey,
        model: cfg.model,
        format: cfg.format,
        maxOutputTokens: cfg.maxOutputTokens,
        userPrompt
      });
      const parsed = extractJsonFromAiText(rawText);
      if (!parsed) {
        pendingAiAction = null;
        pendingAiRequest = { userPrompt, rawText };
        updateAiResponsePreview(rawText || 'AI 未回傳文字', '無法解析 JSON');
        showToast('AI 回應無法解析，請調整提示詞');
        return;
      }

      const plan = {
        summary: typeof parsed.summary === 'string'
          ? parsed.summary
          : (typeof parsed.message === 'string' ? parsed.message : 'AI 計畫'),
        actions: Array.isArray(parsed.actions)
          ? parsed.actions
          : (Array.isArray(parsed.operations)
            ? parsed.operations
            : (parsed.action ? [parsed.action] : []))
      };

      pendingAiAction = plan;
      pendingAiRequest = { userPrompt, rawText, plan };
      const previewText = JSON.stringify(plan, null, 2);
      updateAiResponsePreview(previewText, summarizeAiActions(plan.actions));

      if (aiApprovalMode === 'auto') {
        applyAiActions(plan);
        pendingAiAction = null;
        pendingAiRequest = null;
      } else {
        showToast('AI 計畫已產生，請批准後執行');
      }
    } catch (error) {
      console.error(error);
      pendingAiAction = null;
      pendingAiRequest = null;
      updateAiResponsePreview(String(error?.message || error), 'AI 請求失敗');
      showToast('AI 請求失敗，請檢查 API 設定');
    } finally {
      aiBusy = false;
    }
  }

  function approvePendingAiAction() {
    if (!pendingAiAction) {
      showToast('目前沒有可批准的 AI 動作');
      return;
    }
    const plan = pendingAiAction;
    pendingAiAction = null;
    pendingAiRequest = null;
    applyAiActions(plan);
  }

  async function testAiConnection() {
    if (!enableAiFeature) {
      showToast('請先啟用 AI 實驗功能');
      return;
    }
    const cfg = getAiConfigFromUi();
    if (!cfg.apiKey) {
      showToast('請先輸入 API Key');
      return;
    }
    updateAiResponsePreview('正在測試連線...', '測試中');
    try {
      const text = await callAiEndpoint({
        baseUrl: cfg.baseUrl,
        apiKey: cfg.apiKey,
        model: cfg.model,
        format: cfg.format,
        maxOutputTokens: 128,
        userPrompt: '請只回傳一段簡短的連線成功訊息，不要修改任何內容。'
      });
      updateAiResponsePreview(text || '連線成功，但未取得文字回應。', '連線成功');
      showToast('AI 連線成功');
    } catch (error) {
      console.error(error);
      updateAiResponsePreview(String(error?.message || error), '連線失敗');
      showToast('AI 連線失敗');
    }
  }

  function initAiSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      aiSpeechUnsupported = true;
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'zh-TW';
    recognition.interimResults = true;
    recognition.continuous = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      if (!aiSpeechAutoRestarting) {
        const promptEl = document.getElementById('aiPromptInput');
        if (promptEl) {
          aiSpeechBaseText = promptEl.value || '';
        }
      }
      aiSpeechAutoRestarting = false;
    };

    recognition.onresult = (event) => {
      const lastResult = event.results[event.results.length - 1];
      const transcript = lastResult ? lastResult[0].transcript : '';
      const replaced = applyAiSpeechPunctuation(transcript);
      const promptEl = document.getElementById('aiPromptInput');
      if (promptEl) {
        const base = aiSpeechBaseText || '';
        promptEl.value = base + (base && !base.endsWith(' ') && replaced ? ' ' : '') + replaced;
      }
    };

    recognition.onerror = (event) => {
      console.error('語音辨識錯誤', event.error);
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        showToast('麥克風權限被拒絕，請允許瀏覽器存取麥克風');
      }
      stopAiSpeechRecognition();
    };

    recognition.onend = () => {
      if (aiSpeechRecognizing) {
        aiSpeechAutoRestarting = true;
        const promptEl = document.getElementById('aiPromptInput');
        if (promptEl) {
          aiSpeechBaseText = promptEl.value || '';
        }
        recognition.start();
      } else {
        aiSpeechBaseText = '';
        stopAiSpeechRecognition();
      }
    };

    aiSpeechRecognition = recognition;
  }

  function applyAiSpeechPunctuation(text) {
    if (typeof text !== 'string') return text;
    let result = text;
    result = result.replace(/逗號/g, '，');
    result = result.replace(/句號/g, '。');
    result = result.replace(/頓號/g, '、');
    result = result.replace(/問號/g, '？');
    result = result.replace(/驚嘆號|感嘆號/g, '！');
    result = result.replace(/冒號/g, '：');
    result = result.replace(/分號/g, '；');
    result = result.replace(/波浪號/g, '～');
    result = result.replace(/破折號/g, '—');
    result = result.replace(/刪節號|點點點/g, '…');
    result = result.replace(/左引號|下引號/g, '「');
    result = result.replace(/右引號|上引號/g, '」');
    result = result.replace(/左雙引號/g, '『');
    result = result.replace(/右雙引號/g, '』');
    result = result.replace(/左括號/g, '（');
    result = result.replace(/右括號/g, '）');
    result = result.replace(/左書名號/g, '《');
    result = result.replace(/右書名號/g, '》');
    result = result.replace(/換行|下一行/g, '\n');
    result = result.replace(/空格|空一格/g, ' ');
    return result;
  }

  function toggleAiSpeech() {
    if (aiSpeechUnsupported) {
      showToast('您的瀏覽器不支援語音輸入，請使用 Chrome 或 Edge');
      return;
    }
    if (aiSpeechRecognizing) {
      stopAiSpeechRecognition();
      const help = document.getElementById('aiSpeechHelp');
      if (help) help.style.display = 'none';
    } else {
      startAiSpeechRecognition();
      const help = document.getElementById('aiSpeechHelp');
      if (help) help.style.display = 'block';
    }
  }

  function startAiSpeechRecognition() {
    if (!aiSpeechRecognition) {
      initAiSpeechRecognition();
    }
    if (!aiSpeechRecognition) {
      showToast('語音辨識初始化失敗');
      return;
    }
    if (!document.getElementById('aiPromptInput')) return;

    aiSpeechRecognizing = true;
    updateAiSpeechButtonState();
    try {
      aiSpeechRecognition.start();
    } catch (e) {
      console.error('啟動語音辨識失敗', e);
      aiSpeechRecognizing = false;
      updateAiSpeechButtonState();
    }
  }

  function stopAiSpeechRecognition() {
    aiSpeechRecognizing = false;
    aiSpeechAutoRestarting = false;
    aiSpeechBaseText = '';
    if (aiSpeechRecognition) {
      try {
        aiSpeechRecognition.stop();
      } catch (e) { }
    }
    updateAiSpeechButtonState();
  }

  function updateAiSpeechButtonState() {
    const btn = document.getElementById('aiSpeechBtn');
    if (btn) {
      if (aiSpeechRecognizing) {
        btn.style.background = 'rgba(255, 80, 80, 0.2)';
        btn.style.borderColor = '#ff5050';
        btn.style.color = '#ff5050';
        btn.innerHTML = '⏹️';
        btn.title = '停止語音輸入';
      } else {
        btn.style.background = '';
        btn.style.borderColor = '';
        btn.style.color = '';
        btn.innerHTML = '🎤';
        btn.title = '語音輸入';
      }
    }
  }

  function isAiSpeechUnsupported() {
    return aiSpeechUnsupported;
  }

  window.getCurrentImageRatioInfo = getCurrentImageRatioInfo;
  window.getAiContextSnapshot = getAiContextSnapshot;
  window.loadAiSettings = loadAiSettings;
  window.toggleAiFeatureRequest = toggleAiFeatureRequest;
  window.confirmEnableAiFeature = confirmEnableAiFeature;
  window.cancelEnableAiFeature = cancelEnableAiFeature;
  window.openAiAssistant = openAiAssistant;
  window.closeAiAssistant = closeAiAssistant;
  window.refreshAiContextPreview = refreshAiContextPreview;
  window.updateAiResponsePreview = updateAiResponsePreview;
  window.getAiConfigFromUi = getAiConfigFromUi;
  window.runAiAssistant = runAiAssistant;
  window.approvePendingAiAction = approvePendingAiAction;
  window.testAiConnection = testAiConnection;
  window.saveAiSettings = saveAiSettings;
  window.applyAiActions = applyAiActions;
  window.callAiEndpoint = callAiEndpoint;
  window.buildAiSystemPrompt = buildAiSystemPrompt;
  window.extractJsonFromAiText = extractJsonFromAiText;
  window.normalizeAiTextResponse = normalizeAiTextResponse;
  window.describeAiAction = describeAiAction;
  window.summarizeAiActions = summarizeAiActions;
  window.setAiEntrypointVisibility = setAiEntrypointVisibility;
  window.getAiLayerSnapshot = getAiLayerSnapshot;
  window.toggleAiSpeech = toggleAiSpeech;
  window.startAiSpeechRecognition = startAiSpeechRecognition;
  window.stopAiSpeechRecognition = stopAiSpeechRecognition;
  window.initAiSpeechRecognition = initAiSpeechRecognition;
  window.isAiSpeechUnsupported = isAiSpeechUnsupported;

  document.addEventListener('DOMContentLoaded', () => {
    if (typeof loadAiSettings === 'function') {
      loadAiSettings();
    }
  });
})();
