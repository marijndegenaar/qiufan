# WebGPU Not Working - Hardware Acceleration Disabled

## Current Issue
Brave browser has hardware acceleration completely disabled, which prevents WebGPU from working.

## Immediate Fixes to Try

### 1. Enable Hardware Acceleration in Brave
```
brave://settings/system
```
- Turn ON "Use graphics acceleration when available"
- **Relaunch Brave**

### 2. Enable Brave Flags
```
brave://flags
```
Enable these flags:
- `#enable-unsafe-webgpu` → **Enabled**
- `#ignore-gpu-blocklist` → **Enabled**  
- `#disable-accelerated-video-decode` → **Disabled**
- **Relaunch Brave**

### 3. Check Brave Version
```
brave://version
```
- Ensure you're on Brave 1.60+ (for WebGPU support)
- Update Brave if needed

### 4. Reset Brave GPU Settings
Sometimes Brave caches GPU settings. Try:
1. Close Brave completely
2. Delete GPU cache:
   ```bash
   rm -rf ~/Library/Application\ Support/BraveSoftware/Brave-Browser/Default/GPUCache
   ```
3. Restart Brave

### 5. Check for Conflicting Extensions
- Disable all extensions temporarily
- Reload the page
- If it works, re-enable extensions one by one

### 6. Try a Fresh Brave Profile
```
brave://settings/people
```
- Create a new profile
- Test if WebGPU works there

## Alternative: Use Chrome
If Brave continues to have issues:
```
brew install --cask google-chrome
```
Chrome has better WebGPU support on macOS.

## Verify GPU Status
After each change, check:
```
brave://gpu
```
Look for "WebGPU: Hardware accelerated"
