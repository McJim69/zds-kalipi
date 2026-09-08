<?php
/**
 * ZAMBOANGA DEL SUR KALIPI-RIC WOMEN FEDERATION, INC.
 * Application Versioning & Cache Busting Utility
 */

define('APP_VERSION', '1.0.4');

/**
 * Returns cache-busted URL with filemtime timestamp
 */
function asset_url($path) {
    $fullPath = __DIR__ . '/' . ltrim($path, '/');
    if (file_exists($fullPath)) {
        $mtime = filemtime($fullPath);
        return $path . '?v=' . $mtime;
    }
    return $path . '?v=' . APP_VERSION;
}
