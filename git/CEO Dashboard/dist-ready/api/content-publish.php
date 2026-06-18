<?php
require_once __DIR__ . '/_common.php';

$session = require_auth(['admin', 'uploader', 'pr', 'comms']);

if (!is_post_request()) {
    respond(['error' => 'Method not allowed.'], 405);
}

$body = get_json_body();
$item = $body['item'] ?? [];

if (!is_array($item)) {
    respond(['error' => 'Invalid content payload.'], 400);
}

$role = $session['role'] ?? '';
$status = (string) ($item['status'] ?? '');
$type = (string) ($item['type'] ?? '');

if ($type !== 'Blog') {
    respond(['error' => 'Only blog content can be published to the public blog.'], 400);
}

if (!in_array($status, ['approved', 'published'], true)) {
    respond(['error' => 'Content must be approved before it can be published.'], 400);
}

if (!in_array($role, ['admin', 'uploader', 'pr', 'comms'], true)) {
    respond(['error' => 'Forbidden. Insufficient permissions.'], 403);
}

$title = trim((string) ($item['title'] ?? ''));
$bodyText = trim((string) ($item['body'] ?? ''));
$excerpt = trim((string) ($item['excerpt'] ?? ''));
$slug = trim((string) ($item['slug'] ?? $item['id'] ?? ''));

if ($title === '' || $bodyText === '' || $excerpt === '') {
    respond(['error' => 'Title, excerpt and body are required before publishing.'], 400);
}

$internalPattern = '/supplier cost|dealer cost|account number|margin|internal pricing|secret|password|stock feed|nology|scoop|miro|asbis|core group/i';
$combined = implode("\n", [
    $title,
    $excerpt,
    $bodyText,
    (string) ($item['seoDescription'] ?? ''),
    (string) ($item['keywords'] ?? ''),
]);

if (preg_match($internalPattern, $combined)) {
    respond(['error' => 'Public safety check blocked publishing. Remove supplier/internal pricing references first.'], 400);
}

function public_blog_category($category) {
    $category = strtolower((string) $category);
    if (strpos($category, 'marketing') !== false || strpos($category, 'website') !== false) {
        return 'Digital Marketing';
    }
    if (strpos($category, 'managed') !== false || strpos($category, 'microsoft') !== false || strpos($category, 'business') !== false) {
        return 'Business';
    }
    return 'Connectivity';
}

function public_blog_slug($value) {
    $value = strtolower(trim((string) $value));
    $value = preg_replace('/[^a-z0-9]+/', '-', $value);
    return trim($value, '-') ?: ('blog-' . time());
}

function public_blog_read_time($body) {
    $words = preg_split('/\s+/', trim((string) $body));
    $count = count(array_filter($words));
    return max(1, (int) ceil($count / 220)) . ' min read';
}

$id = public_blog_slug($slug ?: $title);
$post = [
    'id' => $id,
    'title' => $title,
    'excerpt' => $excerpt,
    'body' => $bodyText,
    'category' => public_blog_category($item['category'] ?? ''),
    'date' => date('Y-m-d'),
    'readTime' => public_blog_read_time($bodyText),
    'author' => trim((string) ($item['owner'] ?? 'Onea Africa')) ?: 'Onea Africa',
    'authorRole' => 'Onea Africa Content Team',
    'seoTitle' => trim((string) ($item['seoTitle'] ?? '')),
    'seoDescription' => trim((string) ($item['seoDescription'] ?? '')),
    'publishedBy' => $session['displayName'] ?? $session['username'] ?? 'Launch Platform',
    'publishedAt' => date('c'),
];

$path = __DIR__ . '/data/public-blogs.json';
$posts = load_json_file($path);
if (!is_array($posts)) {
    $posts = [];
}

$posts[$id] = $post;
save_json_file($path, $posts);

$contentItemsPath = __DIR__ . '/data/content-center-items.json';
$contentItems = load_json_file($contentItemsPath);
if (!is_array($contentItems)) {
    $contentItems = [];
}
if (isset($contentItems[$id]) && is_array($contentItems[$id])) {
    $contentItems[$id]['status'] = 'published';
    $contentItems[$id]['updatedAt'] = date('Y-m-d');
    $contentItems[$id]['updatedBy'] = $session['displayName'] ?? $session['username'] ?? 'Launch Platform';
    $contentItems[$id]['publishedAt'] = $post['publishedAt'];
    save_json_file($contentItemsPath, $contentItems);
}

respond([
    'success' => true,
    'post' => $post,
    'message' => 'Blog published to the public website feed.',
]);
