<?php
require __DIR__ . '/_common.php';

if (!is_post_request()) {
    respond(['error' => 'Only POST is accepted.'], 405);
}

$auth = require_auth(['uploader']);

if (!isset($_POST['docKey']) || !isset($_FILES['file'])) {
    respond(['error' => 'Document key and file upload are required.'], 400);
}

$docKey = sanitize($_POST['docKey']);
$file = $_FILES['file'];
if ($file['error'] !== UPLOAD_ERR_OK) {
    respond(['error' => 'Upload failed. Please try again.'], 400);
}

$inspection = inspect_uploaded_file(
    $file['tmp_name'],
    $file['name'],
    ['application/pdf'],
    max(1024, (int) get_env('MAX_DOCUMENT_BYTES', '10485760'))
);
if (!$inspection['ok']) {
    respond(['error' => $inspection['error']], 400);
}

$documents = array_column(get_documents_definition(), null, 'key');
if (!isset($documents[$docKey])) {
    respond(['error' => 'Invalid document key.'], 400);
}

$destination = __DIR__ . '/docs/' . $docKey . '.pdf';
if (!is_dir(dirname($destination))) {
    mkdir(dirname($destination), 0755, true);
}

if (!move_uploaded_file($file['tmp_name'], $destination)) {
    respond(['error' => 'Unable to save uploaded file.'], 500);
}

$metadata = load_json_file(__DIR__ . '/data/documents-metadata.json');
if (!is_array($metadata)) {
    $metadata = [];
}
$metadata[$docKey] = [
    'filename' => basename($destination),
    'uploadedAt' => date('Y-m-d H:i:s'),
    'uploader' => $auth['displayName'],
    'size' => $inspection['size'],
    'mime' => $inspection['mime'],
];
save_json_file(__DIR__ . '/data/documents-metadata.json', $metadata);

respond(['message' => 'Document uploaded successfully.']);
