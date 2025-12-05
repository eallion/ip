// IP 查询工具 - Vercel 风格
document.addEventListener('DOMContentLoaded', () => {
  // 设置当前年份
  document.getElementById('year').textContent = new Date().getFullYear();
  
  initTheme();
  loadIPInfo();
});

// 主题管理
function initTheme() {
  const savedTheme = localStorage.getItem('theme') || 'system';
  setTheme(savedTheme);
  
  document.querySelectorAll('.theme-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const theme = btn.dataset.theme;
      setTheme(theme);
      localStorage.setItem('theme', theme);
    });
  });
}

function setTheme(theme) {
  // 更新按钮状态
  document.querySelectorAll('.theme-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.theme === theme);
  });
  
  // 应用主题
  if (theme === 'system') {
    document.documentElement.removeAttribute('data-theme');
  } else {
    document.documentElement.setAttribute('data-theme', theme);
  }
}

// 加载 IP 信息
async function loadIPInfo() {
  try {
    const response = await fetch('https://api.eallion.com/ip?type=json');
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.status === 'success') {
      renderLayout(data.data);
      await loadExternalIPs();
    } else {
      showError('获取 IP 信息失败');
    }
  } catch (error) {
    console.error('Error:', error);
    showError(`无法连接到服务器：${error.message}`);
  }
}

// 渲染布局
function renderLayout(data) {
  const content = document.getElementById('content');
  
  // 确保 protocol 字段存在
  const protocol = data.protocol || (data.ip && data.ip.includes(':') ? 'IPv6' : 'IPv4');
  
  const html = `
    <!-- 第一行：访问者 IP（全宽）-->
    <div class="full-width-card">
      <div class="card">
        <div class="card-title">您通过 ${protocol} 访问本站</div>
        <div class="visitor-ip">
          <span class="ip-value-large">${data.ip}</span>
          <button class="copy-btn" onclick="copyIP('${data.ip}')">📋 复制</button>
        </div>
      </div>
    </div>

    <!-- 第二行：左右分栏 -->
    <div class="two-column-layout">
      <!-- 左侧 -->
      <div class="left-panel">
        <!-- 访问者双栈 IP -->
        <div class="card">
          <div class="card-title">国内 IP</div>
          <div class="card-content">
            <div class="ip-row">
              <span class="ip-label">IPv4</span>
              <span class="ip-value" id="visitor-ipv4">
                <span class="ip-loading">查询中...</span>
              </span>
            </div>
            <div class="ip-row">
              <span class="ip-label">IPv6</span>
              <span class="ip-value" id="visitor-ipv6">
                <span class="ip-loading">查询中...</span>
              </span>
            </div>
          </div>
        </div>

        <!-- EdgeOne Geo 信息 -->
        <div class="card">
          <div class="card-title">GEO Info</div>
          <div class="geo-grid">
            ${renderGeoItem('国家', data.geo.countryName)}
            ${renderGeoItem('地区', data.geo.regionName)}
            ${renderGeoItem('城市', data.geo.cityName)}
            ${renderGeoItem('ASN', data.geo.asn)}
            ${data.geo.latitude !== 'Unknown' ? renderGeoItem('经纬度', `${parseFloat(data.geo.latitude).toFixed(2)}, ${parseFloat(data.geo.longitude).toFixed(2)}`) : ''}
          </div>
        </div>
      </div>

      <!-- 右侧 -->
      <div class="right-panel">
        <!-- IP.SB 双栈 IP -->
        <div class="card">
          <div class="card-title">国际 IP</div>
          <div class="card-content">
            <div class="ip-row">
              <span class="ip-label">IPv4</span>
              <span class="ip-value" id="ipsb2-ipv4">
                <span class="ip-loading">查询中...</span>
              </span>
            </div>
            <div class="ip-row">
              <span class="ip-label">IPv6</span>
              <span class="ip-value" id="ipsb2-ipv6">
                <span class="ip-loading">查询中...</span>
              </span>
            </div>
          </div>
        </div>

        <!-- IP.SB Geo 信息 -->
        <div class="card">
          <div class="card-title">IP.SB GEO Info</div>
          <div class="geo-grid" id="ipsb-geo">
            <div class="ip-loading">查询中...</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 第三行：其他服务商（全宽）-->
    <div class="full-width-card">
      <div class="card">
        <div class="card-title">其他服务商 IP 查询</div>
        <div class="services-grid">
          <!-- Cloudflare -->
          <div class="service-item">
            <div class="service-name">Cloudflare</div>
            <div class="service-ips">
              <div class="ip-row-inline">
                <span class="protocol-tag">IPv4</span>
                <span class="ip-address" id="cf-ipv4">
                  <span class="ip-loading">...</span>
                </span>
              </div>
              <div class="ip-row-inline">
                <span class="protocol-tag">IPv6</span>
                <span class="ip-address" id="cf-ipv6">
                  <span class="ip-loading">...</span>
                </span>
              </div>
            </div>
          </div>

          <!-- IPInfo.io -->
          <div class="service-item">
            <div class="service-name">IPInfo.io</div>
            <div class="service-ips">
              <div class="ip-row-inline">
                <span class="protocol-tag">IPv4</span>
                <span class="ip-address" id="ipinfo-ipv4">
                  <span class="ip-loading">...</span>
                </span>
              </div>
              <div class="ip-row-inline">
                <span class="protocol-tag">IPv6</span>
                <span class="ip-address" id="ipinfo-ipv6">
                  <span class="ip-loading">...</span>
                </span>
              </div>
            </div>
          </div>

          <!-- ipify -->
          <div class="service-item">
            <div class="service-name">ipify</div>
            <div class="service-ips">
              <div class="ip-row-inline">
                <span class="protocol-tag">IPv4</span>
                <span class="ip-address" id="ipify-ipv4">
                  <span class="ip-loading">...</span>
                </span>
              </div>
              <div class="ip-row-inline">
                <span class="protocol-tag">IPv6</span>
                <span class="ip-address" id="ipify-ipv6">
                  <span class="ip-loading">...</span>
                </span>
              </div>
            </div>
          </div>


        </div>
      </div>
    </div>
  `;
  
  content.innerHTML = html;
}

function renderGeoItem(label, value) {
  if (!value || value === 'Unknown') {
    return '';
  }
  return `
    <div class="geo-item">
      <div class="geo-label">${label}</div>
      <div class="geo-value">${value}</div>
    </div>
  `;
}

// 加载外部服务的 IP
async function loadExternalIPs() {
  const timeout = 10000;
  
  const fetchWithTimeout = async (url, options = {}) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    try {
      const response = await fetch(url, { 
        signal: controller.signal,
        ...options
      });
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const text = await response.text();
      return text.trim();
    } catch (error) {
      clearTimeout(timeoutId);
      console.error(`Error fetching ${url}:`, error);
      
      // 检测被广告拦截器阻止
      if (error.message === 'Failed to fetch' && error.name !== 'AbortError') {
        // Failed to fetch 通常是 CORS 错误或被拦截器阻止
        // 如果不是超时错误，很可能是被屏蔽
        return 'Blocked';
      }
      
      if (error.name === 'AbortError') {
        return 'Timeout';
      }
      return 'Error';
    }
  };
  
  // 访问者双栈 IP - 樱花落
  const fetchVisitorIP = async (version) => {
    try {
      let result;
      if (version === 'ipv4') {
        result = await fetchWithTimeout('https://v4.yinghualuo.cn/bejson');
      } else {
        result = await fetchWithTimeout('https://v6.yinghualuo.cn/bejson');
      }
      
      if (result === 'Error' || result === 'Timeout' || result === 'Blocked') {
        return result;
      }
      
      // 解析 JSON 并提取 ip 字段
      try {
        const data = JSON.parse(result);
        return data.ip || 'Error';
      } catch (e) {
        // 如果不是 JSON，直接返回原始结果
        return result || 'Error';
      }
    } catch (e) {
      return 'Error';
    }
  };
  
  // Cloudflare - 获取 IP 和 Geo
  const fetchCloudflare = async (version) => {
    try {
      let traceUrl;
      if (version === 'ipv4') {
        traceUrl = 'https://1.1.1.1/cdn-cgi/trace';
      } else {
        traceUrl = 'https://[2606:4700:4700::1111]/cdn-cgi/trace';
      }
      
      const trace = await fetchWithTimeout(traceUrl);
      if (trace === 'Error' || trace === 'Timeout' || trace === 'Blocked') {
        return { ip: trace, geo: null };
      }
      
      // 解析 trace 数据
      const lines = trace.split('\n');
      const data = {};
      lines.forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) {
          data[key.trim()] = value.trim();
        }
      });
      
      return {
        ip: data.ip || 'Error',
        geo: data
      };
    } catch (e) {
      return { ip: 'Error', geo: null };
    }
  };
  
  // IP.SB - 获取 IP 和 Geo
  const fetchIPSB = async (version) => {
    try {
      let url;
      if (version === 'ipv4') {
        url = 'https://api-ipv4.ip.sb/geoip';
      } else {
        url = 'https://api-ipv6.ip.sb/geoip';
      }
      
      const result = await fetchWithTimeout(url);
      if (result === 'Error' || result === 'Timeout' || result === 'Blocked') {
        return { ip: result, geo: null };
      }
      
      const data = JSON.parse(result);
      return {
        ip: data.ip || 'Error',
        geo: data
      };
   } catch (e) {
      return { ip: 'Error', geo: null };
    }
  };
  
  // IPInfo.io
  const fetchIPInfo = async (version) => {
    try {
      if (version === 'ipv4') {
        return await fetchWithTimeout('https://ipinfo.io/ip');
      } else {
        return await fetchWithTimeout('https://6.ipinfo.io/ip');
      }
    } catch (e) {
      return 'Error';
    }
  };
  
  // ipify
  const fetchIpify = async (version) => {
    try {
      let result;
      if (version === 'ipv4') {
        result = await fetchWithTimeout('https://api.ipify.org/?format=json');
      } else {
        result = await fetchWithTimeout('https://api64.ipify.org/?format=json');
      }
      
      // 检查特殊状态
      if (result === 'Error' || result === 'Timeout' || result === 'Blocked') {
        return result;
      }
      
      const data = JSON.parse(result);
      return data.ip || 'Error';
    } catch (e) {
      return 'Error';
    }
  };
  
  // 并行查询所有服务
  const [
    visitorIPv4, visitorIPv6,
    cfIPv4Data, cfIPv6Data,
    ipsbIPv4Data, ipsbIPv6Data,
    ipinfoIPv4, ipinfoIPv6,
    ipifyIPv4, ipifyIPv6,

  ] = await Promise.all([
    fetchVisitorIP('ipv4'),
    fetchVisitorIP('ipv6'),
    fetchCloudflare('ipv4'),
    fetchCloudflare('ipv6'),
    fetchIPSB('ipv4'),
    fetchIPSB('ipv6'),
    fetchIPInfo('ipv4'),
    fetchIPInfo('ipv6'),
    fetchIpify('ipv4'),
    fetchIpify('ipv6')

  ]);
  
  // 更新显示
  updateIP('visitor-ipv4', visitorIPv4);
  updateIP('visitor-ipv6', visitorIPv6);
  updateIP('cf-ipv4', cfIPv4Data.ip);
  updateIP('cf-ipv6', cfIPv6Data.ip);
  updateIP('ipsb2-ipv4', ipsbIPv4Data.ip);
  updateIP('ipsb2-ipv6', ipsbIPv6Data.ip);
  updateIP('ipinfo-ipv4', ipinfoIPv4);
  updateIP('ipinfo-ipv6', ipinfoIPv6);
  updateIP('ipify-ipv4', ipifyIPv4);
  updateIP('ipify-ipv6', ipifyIPv6);
  
  // 更新 IP.SB Geo 信息（使用 IPv4 的数据）
  if (ipsbIPv4Data.geo) {
    updateIPSBGeo(ipsbIPv4Data.geo);
  }
}

// 更新 IP 显示
function updateIP(elementId, ip) {
  const element = document.getElementById(elementId);
  if (!element) return;
  
  if (ip === 'Blocked') {
    element.innerHTML = '<span class="ip-blocked">🚫 被屏蔽，请关闭广告插件</span>';
  } else if (ip === 'Error' || ip === 'N/A') {
    element.innerHTML = '<span class="ip-na">不支持</span>';
  } else if (ip === 'Timeout') {
    element.innerHTML = '<span class="ip-error">超时</span>';
  } else {
    // 成功获取到 IP，显示 IP 和复制按钮
    element.innerHTML = `
      <span class="ip-text">${ip}</span>
      <button class="copy-icon-btn" onclick="copyIPDirect('${ip}')" title="复制">📋</button>
    `;
  }
}

// 更新 IP.SB Geo 信息
function updateIPSBGeo(geoData) {
  const geoElement = document.getElementById('ipsb-geo');
  if (!geoElement || !geoData) return;
  
  const html = `
    ${renderGeoItem('国家', geoData.country)}
    ${renderGeoItem('地区', geoData.region)}
    ${renderGeoItem('城市', geoData.city)}
    ${renderGeoItem('ISP', geoData.isp)}
    ${renderGeoItem('ASN', geoData.asn)}
    ${geoData.organization ? renderGeoItem('组织', geoData.organization) : ''}
  `;
  
  geoElement.innerHTML = html || '<div class="ip-na">无数据</div>';
}

// 复制 IP（用于主按钮）
function copyIP(ip) {
  copyToClipboard(ip);
}

// 复制 IP（用于小图标按钮）
function copyIPDirect(ip) {
  copyToClipboard(ip);
}

// 通用复制到剪贴板函数
function copyToClipboard(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => {
      showCopyToast('已复制到剪贴板');
    }).catch(err => {
      console.error('复制失败：', err);
      showCopyToast('复制失败', true);
    });
  } else {
    // 降级方案
    fallbackCopy(text);
  }
}

// 显示复制提示
function showCopyToast(message, isError = false) {
  // 移除已存在的提示
  const existing = document.querySelector('.copy-toast');
  if (existing) {
    existing.remove();
  }
  
  // 创建新提示
  const toast = document.createElement('div');
  toast.className = 'copy-toast' + (isError ? ' error' : '');
  toast.textContent = message;
  document.body.appendChild(toast);
  
  // 显示动画
  setTimeout(() => toast.classList.add('show'), 10);
  
  // 3 秒后移除
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// 降级复制方案
function fallbackCopy(text) {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  
  try {
    document.execCommand('copy');
    showCopyToast('已复制到剪贴板');
  } catch (err) {
    console.error('复制失败：', err);
    showCopyToast('复制失败', true);
  }
  
  document.body.removeChild(textarea);
}

// 错误显示
function showError(message) {
  const content = document.getElementById('content');
  content.innerHTML = `
    <div class="loading">
      <div class="error-icon">⚠️</div>
      <p>${message}</p>
      <button class="copy-btn" onclick="location.reload()" style="margin-top: 20px;">重新加载</button>
    </div>
  `;
}
