// js/utils.js
export function formatMarkdown(text) {
    let html = text
        .replace(/^### (.*)$/gm, '<h2 class="markdown-h2">$1</h2>')
        .replace(/^## (.*)$/gm,  '<h3 class="markdown-h3">$1</h3>')
        .replace(/^# (.*)$/gm,   '<strong class="markdown-strong">$1</strong>')
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g,     '<em>$1</em>')
        .replace(/_(.+?)_/g,       '<u class="markdown-u">$1</u>')
        .replace(/\[(.+?)\]/g,     '<span class="theme-color">$1</span>');

    // Simple list support
    html = html.replace(/^- (.*)$/gm, '<li class="markdown-li">$1</li>')
               .replace(/^\+ (.*)$/gm, '<li class="markdown-li">$1</li>');

    if (html.includes('<li')) {
        if (html.match(/^- /m)) html = '<ul class="markdown-ul">' + html + '</ul>';
        if (html.match(/^\+ /m)) html = '<ol class="markdown-ol">' + html + '</ol>';
    }

    return html;
}

export function applyCase(text, isUpper) {
    return isUpper ? text.toUpperCase() : text.toLowerCase();
}