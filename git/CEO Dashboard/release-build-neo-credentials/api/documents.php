<?php
require __DIR__ . '/_common.php';

$auth = require_auth();
$documents = get_documents_definition();

$metadata = load_json_file(__DIR__ . '/data/documents-metadata.json');
if (!is_array($metadata)) {
    $metadata = [];
}

foreach ($documents as &$document) {
    $path = __DIR__ . '/docs/' . $document['key'] . '.pdf';
    $document['available'] = file_exists($path);
    $document['filename'] = $document['available'] ? basename($path) : null;
    $document['uploadedAt'] = $metadata[$document['key']]['uploadedAt'] ?? null;
    $document['uploader'] = $metadata[$document['key']]['uploader'] ?? null;
}
unset($document);

if (isset($_GET['docKey'])) {
    $docKey = sanitize($_GET['docKey']);
    $document = null;
    foreach ($documents as $doc) {
        if ($doc['key'] === $docKey) {
            $document = $doc;
            break;
        }
    }
    if (!$document) {
        respond(['error' => 'Document not found.'], 404);
    }
    if (!$document['available']) {
        respond(['error' => 'Document not available.'], 404);
    }

    $filePath = __DIR__ . '/docs/' . $docKey . '.pdf';
    if (!file_exists($filePath)) {
        respond(['error' => 'Document missing from storage.'], 404);
    }

    header('Content-Type: application/pdf');
    header('Content-Disposition: inline; filename="' . basename($filePath) . '"');
    header('Content-Length: ' . filesize($filePath));
    header('Accept-Ranges: bytes');
    readfile($filePath);
    exit;
}

respond(['documents' => $documents]);
