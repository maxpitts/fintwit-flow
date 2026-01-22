import React, { useState, useEffect, useRef, useCallback } from 'react';
import { TrendingUp, TrendingDown, Zap, Copy, Download, RefreshCw, Image, Sparkles, Check, ExternalLink, Clock, Flame, Settings, X, Loader2, AlertCircle, Save } from 'lucide-react';

// Tweet style presets with system prompts
const tweetStyles = [
  { 
    id: 'spicy', 
    name: '🌶️ Spicy', 
    desc: 'Hot takes & controversy',
    prompt: 'You are a spicy financial commentator known for hot takes. Write a single tweet (under 280 chars) about this news. Be provocative, use market slang, add emojis sparingly. No hashtags. Be bold and slightly controversial but not offensive.'
  },
  { 
    id: 'pro', 
    name: '📊 Pro', 
    desc: 'Clean & analytical',
    prompt: 'You are a professional market analyst. Write a single tweet (under 280 chars) about this news. Include the ticker symbol with $, mention key levels or metrics if relevant. Clean, analytical tone. No hashtags or excessive emojis.'
  },
  { 
    id: 'degen', 
    name: '🎰 Degen', 
    desc: 'Full send energy',
    prompt: 'You are a degen trader with full send energy. Write a single tweet (under 280 chars) about this news. Use caps for emphasis, rocket emojis, trading slang like "printing", "rekt", "LFG". High energy, gambling mentality. No hashtags.'
  },
  { 
    id: 'news', 
    name: '📰 News', 
    desc: 'Straight facts',
    prompt: 'You are a financial news reporter. Write a single tweet (under 280 chars) about this news. Just the facts - what happened, the numbers, the impact. Professional, neutral tone. Include ticker with $. No hashtags or emojis.'
  },
];

// Settings Modal
const SettingsModal = ({ isOpen, onClose, settings, onSave }) => {
  const [localSettings, setLocalSettings] = useState(settings);
  
  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900 rounded-2xl max-w-lg w-full border border-zinc-700 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-zinc-800">
          <h2 className="text-lg font-bold text-white">Settings</h2>
          <button onClick={onClose} className="p-2 hover:bg-zinc-800 rounded-lg">
            <X className="w-5 h-5 text-zinc-400" />
          </button>
        </div>
        
        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Feedly Access Token
            </label>
            <input
              type="password"
              value={localSettings.feedlyToken}
              onChange={(e) => setLocalSettings({...localSettings, feedlyToken: e.target.value})}
              placeholder="Your Feedly token..."
              className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
            />
            <p className="text-xs text-zinc-500 mt-1">
              Get from Feedly → Settings → API or browser console (feedlyToken)
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Feedly Stream ID (Category/Feed)
            </label>
            <input
              type="text"
              value={localSettings.feedlyStreamId}
              onChange={(e) => setLocalSettings({...localSettings, feedlyStreamId: e.target.value})}
              placeholder="user/xxxxx/category/Finance or feed/http://..."
              className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
            />
            <p className="text-xs text-zinc-500 mt-1">
              Find in Feedly URL or use "user/[userId]/category/global.all" for all
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Branding Text
            </label>
            <input
              type="text"
              value={localSettings.brandingText}
              onChange={(e) => setLocalSettings({...localSettings, brandingText: e.target.value})}
              placeholder="TraderLink.io"
              className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Auto-refresh Interval (minutes)
            </label>
            <select
              value={localSettings.refreshInterval}
              onChange={(e) => setLocalSettings({...localSettings, refreshInterval: parseInt(e.target.value)})}
              className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white focus:outline-none focus:border-blue-500"
            >
              <option value={0}>Disabled</option>
              <option value={5}>5 minutes</option>
              <option value={15}>15 minutes</option>
              <option value={30}>30 minutes</option>
              <option value={60}>1 hour</option>
            </select>
          </div>
        </div>
        
        <div className="p-4 border-t border-zinc-800 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onSave(localSettings);
              onClose();
            }}
            className="flex-1 px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};

// Extract ticker from text
const extractTicker = (text) => {
  const tickerMatch = text.match(/\$([A-Z]{1,5})\b/) || text.match(/\b([A-Z]{2,5})\b(?=.*(?:stock|shares|price|up|down|surge|drop|fall|rise))/i);
  return tickerMatch ? tickerMatch[1] : null;
};

// Detect sentiment from text
const detectSentiment = (text) => {
  const bullishWords = ['surge', 'soar', 'jump', 'rise', 'gain', 'rally', 'up', 'high', 'record', 'boost', 'bullish', 'buy'];
  const bearishWords = ['drop', 'fall', 'plunge', 'crash', 'down', 'low', 'miss', 'cut', 'bearish', 'sell', 'decline', 'slump'];
  
  const lowerText = text.toLowerCase();
  const bullishCount = bullishWords.filter(w => lowerText.includes(w)).length;
  const bearishCount = bearishWords.filter(w => lowerText.includes(w)).length;
  
  if (bullishCount > bearishCount) return 'bullish';
  if (bearishCount > bullishCount) return 'bearish';
  return 'neutral';
};

// Extract percentage from text
const extractPercentage = (text) => {
  const match = text.match(/([+-]?\d+(?:\.\d+)?)\s*%/);
  return match ? parseFloat(match[1]) : null;
};

// Generate tweet using Claude API
const generateTweetWithClaude = async (news, style) => {
  const styleConfig = tweetStyles.find(s => s.id === style);
  
  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        system: styleConfig.prompt,
        messages: [
          { 
            role: "user", 
            content: `Write a tweet about this financial news:\n\nHeadline: ${news.title}\nSource: ${news.source}\n${news.summary ? `Summary: ${news.summary}` : ''}\n\nRespond with ONLY the tweet text, nothing else.`
          }
        ],
      })
    });

    const data = await response.json();
    const tweetText = data.content
      .filter(item => item.type === "text")
      .map(item => item.text)
      .join("");
    
    return tweetText.trim();
  } catch (error) {
    console.error("Claude API error:", error);
    return `${news.title} $${news.ticker || 'SPY'}`;
  }
};

// Canvas-based image generator
const generateImageCanvas = (news, tweet, brandingText) => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  // Twitter/X optimal image size
  canvas.width = 1200;
  canvas.height = 628;
  
  // Create gradient background
  let gradient;
  if (news.sentiment === 'bullish') {
    gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#064e3b');
    gradient.addColorStop(0.5, '#065f46');
    gradient.addColorStop(1, '#000000');
  } else if (news.sentiment === 'bearish') {
    gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#7f1d1d');
    gradient.addColorStop(0.5, '#991b1b');
    gradient.addColorStop(1, '#000000');
  } else {
    gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#1e3a5f');
    gradient.addColorStop(0.5, '#1e40af');
    gradient.addColorStop(1, '#000000');
  }
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Background ticker watermark
  if (news.ticker) {
    ctx.font = 'bold 180px Arial';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.textAlign = 'right';
    ctx.fillText(`$${news.ticker}`, canvas.width - 40, 200);
  }
  
  // Sentiment badge
  ctx.textAlign = 'left';
  const badgeText = news.sentiment === 'bullish' ? '↑ BULLISH' : news.sentiment === 'bearish' ? '↓ BEARISH' : '● NEUTRAL';
  const badgeColor = news.sentiment === 'bullish' ? '#10b981' : news.sentiment === 'bearish' ? '#ef4444' : '#3b82f6';
  
  ctx.fillStyle = badgeColor;
  ctx.beginPath();
  ctx.roundRect(48, 48, 140, 36, 6);
  ctx.fill();
  
  ctx.font = 'bold 16px Arial';
  ctx.fillStyle = '#ffffff';
  ctx.fillText(badgeText, 62, 72);
  
  // Ticker and price change
  if (news.ticker) {
    ctx.font = 'bold 56px Arial';
    ctx.fillStyle = '#ffffff';
    let tickerText = `$${news.ticker}`;
    if (news.priceChange !== null) {
      tickerText += ` ${news.priceChange > 0 ? '+' : ''}${news.priceChange}%`;
    }
    ctx.fillText(tickerText, 48, 150);
  }
  
  // Tweet text with word wrap
  ctx.font = '28px Arial';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  
  const maxWidth = canvas.width - 96;
  const lineHeight = 38;
  const words = tweet.split(' ');
  let line = '';
  let y = 220;
  
  for (let i = 0; i < words.length; i++) {
    const testLine = line + words[i] + ' ';
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && i > 0) {
      ctx.fillText(line.trim(), 48, y);
      line = words[i] + ' ';
      y += lineHeight;
      if (y > 480) break; // Don't overflow
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line.trim(), 48, y);
  
  // Source
  ctx.font = '20px Arial';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.fillText(news.source, 48, canvas.height - 48);
  
  // Branding
  ctx.font = '20px monospace';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.textAlign = 'right';
  ctx.fillText(brandingText, canvas.width - 48, canvas.height - 48);
  
  return canvas;
};

// Tweet Image Preview Card (Tailwind-based for display)
const TweetImageCard = ({ news, tweet, brandingText }) => {
  const getBgClass = () => {
    if (news.sentiment === 'bullish') return 'from-emerald-900 via-emerald-800 to-black';
    if (news.sentiment === 'bearish') return 'from-red-900 via-red-800 to-black';
    return 'from-blue-900 via-blue-800 to-black';
  };
  
  const getBadgeClass = () => {
    if (news.sentiment === 'bullish') return 'bg-emerald-500';
    if (news.sentiment === 'bearish') return 'bg-red-500';
    return 'bg-blue-500';
  };
  
  return (
    <div className={`relative w-full aspect-[1.91/1] bg-gradient-to-br ${getBgClass()} rounded-xl overflow-hidden p-6 flex flex-col justify-between`}>
      {/* Background ticker */}
      {news.ticker && (
        <div className="absolute top-4 right-4 text-7xl font-black text-white/10 select-none">
          ${news.ticker}
        </div>
      )}
      
      {/* Top content */}
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-3">
          <span className={`px-3 py-1 rounded text-xs font-bold ${getBadgeClass()} text-white`}>
            {news.sentiment === 'bullish' ? '↑ BULLISH' : news.sentiment === 'bearish' ? '↓ BEARISH' : '● NEUTRAL'}
          </span>
        </div>
        
        {news.ticker && (
          <div className="text-white text-2xl font-bold">
            ${news.ticker} {news.priceChange !== null && (
              <span className={news.priceChange >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                {news.priceChange > 0 ? '+' : ''}{news.priceChange}%
              </span>
            )}
          </div>
        )}
      </div>
      
      {/* Bottom content */}
      <div className="relative z-10">
        <p className="text-white/90 text-sm leading-relaxed mb-4 line-clamp-4">
          {tweet}
        </p>
        
        <div className="flex items-center justify-between">
          <span className="text-white/40 text-xs">{news.source}</span>
          <span className="text-white/60 text-xs font-mono">{brandingText}</span>
        </div>
      </div>
    </div>
  );
};

// Individual news item component
const NewsItem = ({ news, brandingText }) => {
  const [selectedStyle, setSelectedStyle] = useState('spicy');
  const [generatedTweet, setGeneratedTweet] = useState('');
  const [showImage, setShowImage] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const timeAgo = (date) => {
    const minutes = Math.floor((Date.now() - date) / 60000);
    if (minutes < 60) return `${minutes}m`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)}h`;
    return `${Math.floor(minutes / 1440)}d`;
  };
  
  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const tweet = await generateTweetWithClaude(news, selectedStyle);
      setGeneratedTweet(tweet);
    } catch (error) {
      console.error('Error generating tweet:', error);
      setGeneratedTweet(`${news.title} ${news.ticker ? `$${news.ticker}` : ''}`);
    }
    setIsGenerating(false);
  };
  
  const handleCopy = () => {
    navigator.clipboard.writeText(generatedTweet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  const handleDownloadImage = () => {
    const canvas = generateImageCanvas(news, generatedTweet, brandingText);
    const link = document.createElement('a');
    link.download = `tweet-${news.ticker || 'news'}-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };
  
  return (
    <div className="border-b border-zinc-800 p-4 hover:bg-zinc-900/50 transition-colors">
      <div className="flex items-start gap-3">
        {/* Ticker badge */}
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
          news.sentiment === 'bullish' 
            ? 'bg-emerald-500/20 text-emerald-400' 
            : news.sentiment === 'bearish'
            ? 'bg-red-500/20 text-red-400'
            : 'bg-blue-500/20 text-blue-400'
        }`}>
          {news.ticker || '📰'}
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="font-semibold text-white">{news.source}</span>
            <span className="text-zinc-500">·</span>
            <span className="text-zinc-500 text-sm flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {timeAgo(news.timestamp)}
            </span>
            {news.sourceUrl && (
              <a 
                href={news.sourceUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-zinc-500 hover:text-blue-400 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
            <div className="flex items-center gap-1 ml-auto">
              <Flame className={`w-4 h-4 ${news.heat > 90 ? 'text-orange-500' : 'text-zinc-600'}`} />
              <span className={`text-xs ${news.heat > 90 ? 'text-orange-500' : 'text-zinc-600'}`}>
                {news.heat}
              </span>
            </div>
          </div>
          
          <p className="text-white mb-2">{news.title}</p>
          
          {news.summary && (
            <p className="text-zinc-500 text-sm mb-2 line-clamp-2">{news.summary}</p>
          )}
          
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            {news.priceChange !== null && (
              <>
                <span className={`text-sm font-semibold ${
                  news.priceChange > 0 ? 'text-emerald-400' : news.priceChange < 0 ? 'text-red-400' : 'text-zinc-400'
                }`}>
                  {news.priceChange > 0 ? '+' : ''}{news.priceChange}%
                </span>
                {news.priceChange > 0 ? (
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                ) : news.priceChange < 0 ? (
                  <TrendingDown className="w-4 h-4 text-red-400" />
                ) : null}
              </>
            )}
            {news.categories?.slice(0, 2).map((cat, i) => (
              <span key={i} className="text-zinc-500 text-sm px-2 py-0.5 bg-zinc-800 rounded">
                {cat}
              </span>
            ))}
          </div>
          
          {/* Style selector */}
          <div className="flex flex-wrap gap-2 mb-3">
            {tweetStyles.map(style => (
              <button
                key={style.id}
                onClick={() => setSelectedStyle(style.id)}
                title={style.desc}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  selectedStyle === style.id
                    ? 'bg-blue-500 text-white'
                    : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                }`}
              >
                {style.name}
              </button>
            ))}
          </div>
          
          {/* Generate button */}
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-full text-sm font-medium transition-all disabled:opacity-50"
          >
            {isGenerating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            {isGenerating ? 'Generating...' : 'Generate Tweet'}
          </button>
          
          {/* Generated tweet */}
          {generatedTweet && (
            <div className="mt-4 space-y-3">
              <div className="p-4 bg-zinc-800/50 rounded-xl border border-zinc-700">
                <p className="text-white whitespace-pre-wrap">{generatedTweet}</p>
                <div className="text-xs text-zinc-500 mt-2">
                  {generatedTweet.length}/280 characters
                </div>
                <div className="flex items-center gap-2 mt-3 flex-wrap">
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-700 hover:bg-zinc-600 rounded-lg text-xs text-zinc-300 transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                  <button
                    onClick={() => setShowImage(!showImage)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors ${
                      showImage 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-zinc-700 hover:bg-zinc-600 text-zinc-300'
                    }`}
                  >
                    <Image className="w-3.5 h-3.5" />
                    {showImage ? 'Hide Image' : 'Show Image'}
                  </button>
                  <button
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-700 hover:bg-zinc-600 rounded-lg text-xs text-zinc-300 transition-colors disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
                    Regenerate
                  </button>
                </div>
              </div>
              
              {/* Image preview */}
              {showImage && (
                <div className="space-y-3">
                  <TweetImageCard 
                    news={news} 
                    tweet={generatedTweet} 
                    brandingText={brandingText}
                  />
                  <button
                    onClick={handleDownloadImage}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-sm text-white transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Download PNG (1200×628)
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Demo news for when Feedly isn't configured
const demoNews = [
  {
    id: 1,
    title: "NVIDIA Surges 8% on Record AI Chip Demand from Major Cloud Providers",
    source: "Reuters",
    sourceUrl: "https://reuters.com",
    summary: "NVIDIA shares jumped after the company reported unprecedented demand for its H100 and upcoming Blackwell chips from hyperscalers.",
    timestamp: new Date(Date.now() - 1000 * 60 * 15),
    ticker: "NVDA",
    sentiment: "bullish",
    priceChange: 8.2,
    heat: 98,
    categories: ["Tech", "AI"],
  },
  {
    id: 2,
    title: "Federal Reserve Signals Potential Rate Cut at September Meeting",
    source: "Bloomberg",
    sourceUrl: "https://bloomberg.com",
    summary: "Fed officials indicated growing confidence that inflation is moving sustainably toward target, opening door to rate cuts.",
    timestamp: new Date(Date.now() - 1000 * 60 * 32),
    ticker: "SPY",
    sentiment: "bullish",
    priceChange: 1.4,
    heat: 95,
    categories: ["Macro", "Fed"],
  },
  {
    id: 3,
    title: "Tesla Deliveries Miss Wall Street Estimates, Stock Drops 5%",
    source: "CNBC",
    sourceUrl: "https://cnbc.com",
    summary: "Tesla delivered fewer vehicles than expected in Q2, raising concerns about demand and increased competition in EV market.",
    timestamp: new Date(Date.now() - 1000 * 60 * 48),
    ticker: "TSLA",
    sentiment: "bearish",
    priceChange: -5.1,
    heat: 87,
    categories: ["EV", "Earnings"],
  },
  {
    id: 4,
    title: "GameStop Rallies 40% as Keith Gill Returns to Social Media",
    source: "Yahoo Finance",
    sourceUrl: "https://finance.yahoo.com",
    summary: "Meme stock phenomenon returns as Roaring Kitty posts cryptic message, triggering massive retail buying activity.",
    timestamp: new Date(Date.now() - 1000 * 60 * 95),
    ticker: "GME",
    sentiment: "bullish",
    priceChange: 42.3,
    heat: 99,
    categories: ["Meme", "Retail"],
  },
  {
    id: 5,
    title: "Apple Announces $110B Stock Buyback Program",
    source: "WSJ",
    sourceUrl: "https://wsj.com",
    summary: "Apple unveiled the largest stock buyback in corporate history, signaling confidence in future growth.",
    timestamp: new Date(Date.now() - 1000 * 60 * 120),
    ticker: "AAPL",
    sentiment: "bullish",
    priceChange: 2.8,
    heat: 82,
    categories: ["Tech", "Buyback"],
  },
  {
    id: 6,
    title: "Oil Plunges 4% on OPEC Supply Decision",
    source: "Financial Times",
    sourceUrl: "https://ft.com",
    summary: "Crude prices tumbled after OPEC+ announced plans to gradually restore production cuts.",
    timestamp: new Date(Date.now() - 1000 * 60 * 150),
    ticker: "USO",
    sentiment: "bearish",
    priceChange: -4.2,
    heat: 76,
    categories: ["Commodities", "Energy"],
  },
];

// Main App
export default function FinTweetFlow() {
  const [news, setNews] = useState(demoNews);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filter, setFilter] = useState('all');
  const [showSettings, setShowSettings] = useState(false);
  const [error, setError] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [settings, setSettings] = useState({
    feedlyToken: '',
    feedlyStreamId: '',
    brandingText: 'Trades & Gains',
    refreshInterval: 30,
  });
  
  const isConfigured = settings.feedlyToken && settings.feedlyStreamId;
  
  const handleSaveSettings = (newSettings) => {
    setSettings(newSettings);
  };
  
  const filteredNews = news.filter(item => {
    if (filter === 'all') return true;
    if (filter === 'bullish') return item.sentiment === 'bullish';
    if (filter === 'bearish') return item.sentiment === 'bearish';
    if (filter === 'hot') return item.heat > 90;
    return true;
  });
  
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Settings Modal */}
      <SettingsModal 
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        settings={settings}
        onSave={handleSaveSettings}
      />
      
      {/* Header */}
      <header className="sticky top-0 z-40 bg-black/80 backdrop-blur-xl border-b border-zinc-800">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Zap className="w-6 h-6 text-yellow-500" />
              <h1 className="text-xl font-bold">FinTweet Flow</h1>
              <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full">
                Demo
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowSettings(true)}
                className="p-2 hover:bg-zinc-800 rounded-full transition-colors"
              >
                <Settings className="w-5 h-5 text-zinc-400" />
              </button>
              <button
                onClick={() => setLastRefresh(new Date())}
                disabled={isRefreshing}
                className="p-2 hover:bg-zinc-800 rounded-full transition-colors"
              >
                <RefreshCw className={`w-5 h-5 text-zinc-400 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
          
          <div className="text-xs text-zinc-500 mb-3">
            Last updated: {lastRefresh.toLocaleTimeString()}
          </div>
          
          {/* Filters */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {[
              { id: 'all', label: 'All' },
              { id: 'hot', label: '🔥 Hot' },
              { id: 'bullish', label: '📈 Bullish' },
              { id: 'bearish', label: '📉 Bearish' },
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  filter === f.id
                    ? 'bg-white text-black'
                    : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </header>
      
      {/* Feed */}
      <main className="max-w-2xl mx-auto">
        {filteredNews.map(item => (
          <NewsItem 
            key={item.id} 
            news={item} 
            brandingText={settings.brandingText}
          />
        ))}
      </main>
      
      {/* Footer */}
      <footer className="max-w-2xl mx-auto p-4 border-t border-zinc-800 mt-8">
        <div className="text-center space-y-2">
          <p className="text-zinc-500 text-sm">
            {settings.brandingText} · Powered by Claude
          </p>
          <button
            onClick={() => setShowSettings(true)}
            className="text-blue-400 hover:text-blue-300 text-sm"
          >
            Configure Feedly for live news →
          </button>
        </div>
      </footer>
    </div>
  );
}
