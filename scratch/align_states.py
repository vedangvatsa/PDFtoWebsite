import json
import os

x_state_path = "/Users/vedang/PDFtoWebsite/.github/scripts/x-state.json"
bsky_state_path = "/Users/vedang/PDFtoWebsite/.github/scripts/bsky-state.json"
meta_state_path = "/Users/vedang/PDFtoWebsite/.github/scripts/meta-state.json"

# 1. Update x-state.json
if os.path.exists(x_state_path):
    with open(x_state_path, 'r', encoding='utf-8') as f:
        x_state = json.load(f)
    if "engagement" in x_state:
        print(f"Twitter (X) engagement index was: {x_state['engagement']['index']}")
        x_state["engagement"]["index"] = 55
    with open(x_state_path, 'w', encoding='utf-8') as f:
        json.dump(x_state, f, indent=2, ensure_ascii=False)
    print("✅ Aligned Twitter (X) engagement index to 55!")

# 2. Update bsky-state.json
if os.path.exists(bsky_state_path):
    with open(bsky_state_path, 'r', encoding='utf-8') as f:
        bsky_state = json.load(f)
    print(f"Bluesky index was: {bsky_state.get('index')}")
    bsky_state["index"] = 55
    with open(bsky_state_path, 'w', encoding='utf-8') as f:
        json.dump(bsky_state, f, indent=2, ensure_ascii=False)
    print("✅ Aligned Bluesky index to 55!")

# 3. Update meta-state.json (double check/verify)
if os.path.exists(meta_state_path):
    with open(meta_state_path, 'r', encoding='utf-8') as f:
        meta_state = json.load(f)
    print(f"Meta indices: FB {meta_state.get('facebook', {}).get('index')}, IG {meta_state.get('instagram', {}).get('index')}, Threads {meta_state.get('threads', {}).get('index')}")
    # Force alignment just in case
    meta_state["facebook"]["index"] = 55
    meta_state["instagram"]["index"] = 55
    meta_state["threads"]["index"] = 55
    with open(meta_state_path, 'w', encoding='utf-8') as f:
        json.dump(meta_state, f, indent=2, ensure_ascii=False)
    print("✅ Aligned Meta indices to 55!")

print("All states aligned successfully!")
