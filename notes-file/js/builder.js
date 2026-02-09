// js/builder.js
import { getLessons, setLessons, saveToLocal } from './storage.js';
import { showNotification } from './ui.js';

let builderData = {};

export function initBuilder() {
    const builderContainer = document.getElementById('builderContainer');
    const builderCancel   = document.getElementById('builderCancel');
    const builderExport   = document.getElementById('builderExport');
    const builderAdd      = document.getElementById('builderAdd');
    const previewClear    = document.getElementById('previewClear');

    builderCancel.addEventListener('click', () => {
        builderContainer.classList.remove('active');
        builderData = {};
        updateBuilderPreview();
    });

    builderAdd.addEventListener('click', addBuilderEntry);
    builderExport.addEventListener('click', exportBuilder);
    previewClear.addEventListener('click', clearBuilder);

    function addBuilderEntry() {
        const topic = document.getElementById('builderTopic').value.trim();
        const desc  = document.getElementById('builderDesc').value.trim();
        const exStr = document.getElementById('builderEx').value.trim();

        if (!topic || !desc || !exStr) {
            alert("Please fill all fields");
            return;
        }

        builderData[topic] = {
            desc,
            ex: exStr.split(',').map(s => s.trim()).filter(Boolean)
        };

        updateBuilderPreview();
        document.getElementById('builderTopic').value = '';
        document.getElementById('builderDesc').value = '';
        document.getElementById('builderEx').value = '';
    }

    function updateBuilderPreview() {
        const preview = document.getElementById('builderPreview');
        const count   = document.getElementById('builderEntryCount');

        if (Object.keys(builderData).length === 0) {
            preview.textContent = "No entries yet";
        } else {
            preview.textContent = JSON.stringify(builderData, null, 2);
        }
        count.textContent = `${Object.keys(builderData).length} entries`;
    }

    function clearBuilder() {
        if (confirm("Clear all entries?")) {
            builderData = {};
            updateBuilderPreview();
        }
    }

    function exportBuilder() {
        if (Object.keys(builderData).length === 0) {
            alert("Nothing to export");
            return;
        }

        const json = JSON.stringify(builderData, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `custom-notes-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);

        // Also merge into main lessons
        setLessons({ ...getLessons(), ...builderData });
        saveToLocal();
        showNotification("Notes exported & saved!", "📤");
    }
}