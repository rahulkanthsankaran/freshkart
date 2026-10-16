<?php
/**
 * FreshKart — Server-Side Web URL & E-Commerce Metadata Analyzer
 * Supports live metadata extraction, OpenGraph tags, HTTP status, and DOM inspection.
 */

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$rawUrl = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $rawUrl = $input['url'] ?? $_POST['url'] ?? '';
} else {
    $rawUrl = $_GET['url'] ?? '';
}

$rawUrl = trim($rawUrl);

if (empty($rawUrl)) {
    echo json_encode([
        'success' => false,
        'message' => 'Please provide a valid URL to analyze.'
    ]);
    exit;
}

// Ensure protocol exists
if (!preg_match('#^https?://#i', $rawUrl)) {
    $rawUrl = 'https://' . $rawUrl;
}

if (!filter_var($rawUrl, FILTER_VALIDATE_URL)) {
    echo json_encode([
        'success' => false,
        'message' => 'Invalid URL syntax. Please enter a valid HTTP or HTTPS address.'
    ]);
    exit;
}

$parsedUrl = parse_url($rawUrl);
$scheme   = $parsedUrl['scheme'] ?? 'http';
$host     = $parsedUrl['host'] ?? '';
$port     = $parsedUrl['port'] ?? ($scheme === 'https' ? 443 : 80);
$path     = $parsedUrl['path'] ?? '/';
$queryStr = $parsedUrl['query'] ?? '';
$fragment = $parsedUrl['fragment'] ?? '';

// Parse query params into associative array
$queryParams = [];
if (!empty($queryStr)) {
    parse_str($queryStr, $queryParams);
}

// YouTube specific detection
$isYouTube = false;
$youtubeId = '';
if (stripos($host, 'youtube.com') !== false || stripos($host, 'youtu.be') !== false) {
    $isYouTube = true;
    if (stripos($host, 'youtu.be') !== false) {
        $youtubeId = ltrim($path, '/');
    } elseif (isset($queryParams['v'])) {
        $youtubeId = $queryParams['v'];
    } elseif (preg_match('#/(?:embed|v|shorts)/([a-zA-Z0-9_-]{11})#', $path, $matches)) {
        $youtubeId = $matches[1];
    }
}

// Fetch live webpage content via cURL
$ch = curl_init();
curl_setopt_array($ch, [
    CURLOPT_URL            => $rawUrl,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_FOLLOWLOCATION => true,
    CURLOPT_MAXREDIRS      => 5,
    CURLOPT_TIMEOUT        => 6,
    CURLOPT_CONNECTTIMEOUT => 4,
    CURLOPT_USERAGENT      => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 FreshKart-Analyzer/2.0',
    CURLOPT_SSL_VERIFYPEER => false,
    CURLOPT_SSL_VERIFYHOST => false,
    CURLOPT_ENCODING       => '',
    CURLOPT_HEADER         => false
]);

$responseHtml = curl_exec($ch);
$httpCode     = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$contentType  = curl_getinfo($ch, CURLINFO_CONTENT_TYPE);
$totalTime    = curl_getinfo($ch, CURLINFO_TOTAL_TIME);
$finalUrl     = curl_getinfo($ch, CURLINFO_EFFECTIVE_URL);
$curlError    = curl_error($ch);
curl_close($ch);

// Default metadata
$title = '';
$description = '';
$ogTitle = '';
$ogDesc = '';
$ogImage = '';
$ogSiteName = '';
$canonical = $finalUrl ?: $rawUrl;
$headings = [];
$images = [];
$links = [];
$extractedPrice = '';

if ($responseHtml && $httpCode >= 200 && $httpCode < 400) {
    // Parse HTML DOM safely
    libxml_use_internal_errors(true);
    $dom = new DOMDocument();
    @$dom->loadHTML('<?xml encoding="utf-8" ?>' . $responseHtml);
    libxml_clear_errors();

    $xpath = new DOMXPath($dom);

    // Title
    $titleNode = $xpath->query('//title');
    if ($titleNode->length > 0) {
        $title = trim($titleNode->item(0)->textContent);
    }

    // Meta Tags
    $metaTags = $xpath->query('//meta');
    foreach ($metaTags as $meta) {
        $name     = strtolower($meta->getAttribute('name'));
        $prop     = strtolower($meta->getAttribute('property'));
        $content  = trim($meta->getAttribute('content'));

        if (empty($content)) continue;

        if ($name === 'description' && empty($description)) {
            $description = $content;
        } elseif ($prop === 'og:title') {
            $ogTitle = $content;
        } elseif ($prop === 'og:description') {
            $ogDesc = $content;
        } elseif ($prop === 'og:image') {
            $ogImage = $content;
        } elseif ($prop === 'og:site_name') {
            $ogSiteName = $content;
        } elseif (in_array($name, ['twitter:title', 'twitter:description', 'twitter:image'])) {
            if ($name === 'twitter:title' && empty($ogTitle)) $ogTitle = $content;
            if ($name === 'twitter:description' && empty($ogDesc)) $ogDesc = $content;
            if ($name === 'twitter:image' && empty($ogImage)) $ogImage = $content;
        }
    }

    // Headings (H1 to H3)
    $headingNodes = $xpath->query('//h1 | //h2 | //h3');
    $hCount = 0;
    foreach ($headingNodes as $h) {
        if ($hCount++ >= 12) break;
        $hText = trim(preg_replace('/\s+/', ' ', $h->textContent));
        if (!empty($hText)) {
            $headings[] = [
                'tag'  => strtoupper($h->nodeName),
                'text' => mb_substr($hText, 0, 120)
            ];
        }
    }

    // Extract Images
    $imgNodes = $xpath->query('//img[@src]');
    $iCount = 0;
    foreach ($imgNodes as $img) {
        if ($iCount++ >= 12) break;
        $src = trim($img->getAttribute('src'));
        $alt = trim($img->getAttribute('alt'));
        if (!empty($src)) {
            // Resolve relative URLs
            if (strpos($src, '//') === 0) {
                $src = $scheme . ':' . $src;
            } elseif (strpos($src, '/') === 0) {
                $src = $scheme . '://' . $host . $src;
            } elseif (!preg_match('#^https?://#i', $src)) {
                $src = rtrim($scheme . '://' . $host . dirname($path), '/') . '/' . $src;
            }
            $images[] = [
                'src' => $src,
                'alt' => $alt ?: 'Product Image Asset'
            ];
        }
    }

    // Extract Links
    $aNodes = $xpath->query('//a[@href]');
    $lCount = 0;
    foreach ($aNodes as $a) {
        if ($lCount++ >= 12) break;
        $href = trim($a->getAttribute('href'));
        $text = trim(preg_replace('/\s+/', ' ', $a->textContent));
        if (!empty($href) && $href !== '#' && strpos($href, 'javascript:') !== 0) {
            $links[] = [
                'href' => $href,
                'text' => mb_substr($text ?: $href, 0, 70)
            ];
        }
    }

    // Price regex heuristics (e.g. ₹38, Rs. 140, $24.99)
    if (preg_match('/(₹\s?[\d,]+(?:\.\d{2})?|Rs\.?\s?[\d,]+(?:\.\d{2})?|\$\s?[\d,]+(?:\.\d{2})?)/u', $responseHtml, $pMatch)) {
        $extractedPrice = $pMatch[1];
    }
}

// Fallback metadata if title is empty
if (empty($title)) {
    $title = $ogTitle ?: ($host . ' — ' . ltrim($path, '/'));
}
if (empty($description)) {
    $description = $ogDesc ?: 'Webpage resource analyzed from ' . $host;
}

// If YouTube detected and ogImage empty, use maxresdefault or hqdefault
if ($isYouTube && !empty($youtubeId) && empty($ogImage)) {
    $ogImage = "https://img.youtube.com/vi/{$youtubeId}/hqdefault.jpg";
    if (empty($title) || $title === $host) {
        $title = "YouTube Video [ID: {$youtubeId}]";
    }
}

echo json_encode([
    'success'       => true,
    'status_code'   => $httpCode ?: 200,
    'url'           => $rawUrl,
    'final_url'     => $finalUrl ?: $rawUrl,
    'parsed'        => [
        'scheme'    => $scheme,
        'host'      => $host,
        'port'      => $port,
        'path'      => $path,
        'query'     => $queryStr,
        'fragment'  => $fragment,
        'params'    => $queryParams
    ],
    'is_youtube'    => $isYouTube,
    'youtube_id'    => $youtubeId,
    'metadata'      => [
        'title'       => $title,
        'description' => $description,
        'og_title'    => $ogTitle,
        'og_desc'     => $ogDesc,
        'og_image'    => $ogImage,
        'og_site_name'=> $ogSiteName,
        'price'       => $extractedPrice,
        'canonical'   => $canonical,
        'content_type'=> $contentType,
        'total_time'  => round($totalTime, 3) . 's'
    ],
    'headings'      => $headings,
    'images'        => $images,
    'links'         => $links,
    'curl_error'    => $curlError ?: null
], JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT);
