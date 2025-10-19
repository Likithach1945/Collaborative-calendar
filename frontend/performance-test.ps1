# Performance Testing Script
# Run this after starting the dev server (npm run dev)

Write-Host "🚀 Calendar App Performance Testing" -ForegroundColor Cyan
Write-Host "====================================`n" -ForegroundColor Cyan

# Check if dev server is running
Write-Host "📡 Checking if dev server is running..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5173" -UseBasicParsing -TimeoutSec 2 -ErrorAction Stop
    Write-Host "✅ Dev server is running`n" -ForegroundColor Green
} catch {
    Write-Host "❌ Dev server is not running!" -ForegroundColor Red
    Write-Host "   Please start it with: npm run dev`n" -ForegroundColor Yellow
    exit 1
}

# Build production bundle
Write-Host "🔨 Building production bundle..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed!`n" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Build complete`n" -ForegroundColor Green

# Analyze bundle
Write-Host "📊 Analyzing bundle size..." -ForegroundColor Yellow
Write-Host "   Opening bundle analyzer...`n" -ForegroundColor Gray

# Get bundle sizes
$distPath = ".\dist"
if (Test-Path $distPath) {
    $jsFiles = Get-ChildItem -Path "$distPath\assets\js" -Filter "*.js" -ErrorAction SilentlyContinue
    $cssFiles = Get-ChildItem -Path "$distPath\assets\css" -Filter "*.css" -ErrorAction SilentlyContinue
    
    $totalJsSize = ($jsFiles | Measure-Object -Property Length -Sum).Sum / 1KB
    $totalCssSize = ($cssFiles | Measure-Object -Property Length -Sum).Sum / 1KB
    
    Write-Host "📦 Bundle Sizes:" -ForegroundColor Cyan
    Write-Host "   JavaScript: $([math]::Round($totalJsSize, 2)) KB" -ForegroundColor White
    Write-Host "   CSS: $([math]::Round($totalCssSize, 2)) KB" -ForegroundColor White
    Write-Host "   Total: $([math]::Round($totalJsSize + $totalCssSize, 2)) KB`n" -ForegroundColor White
    
    if ($totalJsSize -gt 500) {
        Write-Host "   ⚠️  Warning: JS bundle is larger than 500KB" -ForegroundColor Yellow
    } else {
        Write-Host "   ✅ JS bundle size is good!" -ForegroundColor Green
    }
    Write-Host ""
}

# Run bundle analyzer
Write-Host "📈 Generating bundle visualization..." -ForegroundColor Yellow
npm run analyze

Write-Host "`n✅ Performance testing complete!" -ForegroundColor Green
Write-Host "====================================`n" -ForegroundColor Cyan
Write-Host "📝 Next Steps:" -ForegroundColor Cyan
Write-Host "   1. Review bundle analyzer (should open automatically)" -ForegroundColor White
Write-Host "   2. Run Lighthouse audit: npm run lighthouse" -ForegroundColor White
Write-Host "   3. Check PERFORMANCE.md for optimization tips`n" -ForegroundColor White
