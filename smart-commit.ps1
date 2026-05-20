# smart-commit.ps1
# Premium Git Helper for PrintsByPaws Clone

Clear-Host
Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host "       SMART GIT INTERACTIVE SINGLE-COMMIT HELPER      " -ForegroundColor Cyan
Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host ""

# Get git status --porcelain
$statusLines = git status --porcelain

if ($statusLines.Count -eq 0 -or $statusLines -eq $null) {
    Write-Host "No changes detected in the git repository." -ForegroundColor Green
    exit
}

Write-Host "Analyzing changes..." -ForegroundColor Gray
Write-Host ""

$changes = @()

foreach ($line in $statusLines) {
    # Match the porcelain git status format
    if ($line -match '^([ MADRC\?]{2})\s+(.+)$') {
        $code = $Matches[1].Trim()
        $file = $Matches[2].Trim()
        
        # Strip outer quotes if Git returned them (due to spaces in paths)
        if ($file -match '^"(.*)"$') {
            $file = $Matches[1]
        }
        
        $statusText = ""
        $color = "White"
        
        switch ($code) {
            "M"  { $statusText = "Modified"; $color = "Yellow" }
            "D"  { $statusText = "Deleted" ; $color = "Red" }
            "A"  { $statusText = "Added"   ; $color = "Green" }
            "??" { $statusText = "Untracked"; $color = "Cyan" }
            default { $statusText = "Changed" ; $color = "Gray" }
        }
        
        $changes += [PSCustomObject]@{
            Status = $statusText
            File = $file
            Code = $code
            Color = $color
        }
    }
}

Write-Host "Detected $($changes.Count) changed item(s):" -ForegroundColor White
foreach ($c in $changes) {
    Write-Host "  [$($c.Status)] " -NoNewline -ForegroundColor $c.Color
    Write-Host $c.File -ForegroundColor White
}
Write-Host ""
Write-Host "Starting interactive single-file commit sequence..." -ForegroundColor Gray
Write-Host ""

$index = 0
foreach ($c in $changes) {
    $index++
    Write-Host "--------------------------------------------------------" -ForegroundColor Gray
    Write-Host "Item $index of $($changes.Count):" -ForegroundColor Gray
    Write-Host "  Action: " -NoNewline -ForegroundColor Gray
    Write-Host $c.Status -ForegroundColor $c.Color
    Write-Host "  File  : " -NoNewline -ForegroundColor Gray
    Write-Host $c.File -ForegroundColor White
    Write-Host ""
    
    $action = Read-Host "Stage and commit this change? [y = Yes / n = Skip / a = Commit All Remaining / q = Quit]"
    if ([string]::IsNullOrEmpty($action)) {
        $action = "y"
    }
    $action = $action.ToLower().Trim()
    
    if ($action -eq 'q') {
        Write-Host "Exiting interactive commit sequence." -ForegroundColor Yellow
        break
    }
    
    if ($action -eq 'a') {
        Write-Host "Staging all remaining changes..." -ForegroundColor Cyan
        git add -A
        $globalMessage = Read-Host "Enter commit message for all remaining changes"
        if ([string]::IsNullOrWhiteSpace($globalMessage)) {
            $globalMessage = "Update project components and assets"
        }
        git commit -m $globalMessage
        Write-Host "All remaining changes committed successfully!" -ForegroundColor Green
        break
    }
    
    if ($action -eq 'y') {
        # Suggest a smart default message
        $suggestedMsg = ""
        $filename = [System.IO.Path]::GetFileName($c.File)
        switch ($c.Status) {
            "Modified" { $suggestedMsg = "Update $filename component" }
            "Deleted"  { $suggestedMsg = "Prune unused asset: $filename" }
            "Added"    { $suggestedMsg = "Add $filename asset" }
            "Untracked" { $suggestedMsg = "Add $filename asset" }
            default    { $suggestedMsg = "Update $filename" }
        }
        
        Write-Host "  Suggested message: " -NoNewline -ForegroundColor Gray
        Write-Host $suggestedMsg -ForegroundColor DarkCyan
        
        $msg = Read-Host "  Enter commit message (Press Enter to use suggestion)"
        if ([string]::IsNullOrWhiteSpace($msg)) {
            $msg = $suggestedMsg
        }
        
        # Stage/unstage specifically
        if ($c.Status -eq "Deleted") {
            git rm "$($c.File)" --ignore-unmatch 2>$null | Out-Null
            git add "$($c.File)" 2>$null | Out-Null
        } else {
            git add "$($c.File)"
        }
        
        # Commit individual file
        git commit -m $msg
        Write-Host "  Successfully staged and committed!" -ForegroundColor Green
    } else {
        Write-Host "  Skipped." -ForegroundColor Gray
    }
    Write-Host ""
}

Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host "              GIT COMMIT SEQUENCE COMPLETED            " -ForegroundColor Cyan
Write-Host "=======================================================" -ForegroundColor Cyan
