<!-- Update the builder-preview section in your HTML -->
<div class="builder-preview">
    <div class="preview-header">
        <h3 class="preview-title">Notes Preview</h3>
        <div class="preview-actions">
            <button class="preview-clear" id="previewClear">Clear All</button>
            <button class="preview-mode-btn" id="previewModeToggle">Table View</button>
        </div>
    </div>
    
    <!-- Add search/filter input -->
    <div class="preview-search">
        <input type="text" id="previewSearch" placeholder="Search notes..." style="width: 100%; padding: 8px; margin-bottom: 10px; border: 1px solid var(--border-color); border-radius: 4px;">
    </div>
    
    <!-- Table view for better management -->
    <div class="preview-table-container" id="previewTableContainer" style="display: none;">
        <table class="preview-table">
            <thead>
                <tr>
                    <th>Topic</th>
                    <th>Description</th>
                    <th>Examples</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody id="previewTableBody">
                <!-- Table rows will be inserted here -->
            </tbody>
        </table>
    </div>
    
    <!-- JSON view (original) -->
    <div class="preview-content-container" id="previewContentContainer">
        <pre class="preview-content" id="builderPreview">No entries yet</pre>
    </div>
    
    <div class="entry-count" id="builderEntryCount">0 entries</div>
</div>

<!-- Add Edit/Delete buttons to the builder form actions -->
<div class="builder-form-actions" id="builderFormActions" style="margin-top: 20px; display: none;">
    <button class="builder-btn builder-update" id="builderUpdate">Update Note</button>
    <button class="builder-btn builder-cancel-edit" id="builderCancelEdit">Cancel Edit</button>
    <button class="builder-btn builder-delete" id="builderDelete" style="background: #e74c3c;">Delete Note</button>
</div>