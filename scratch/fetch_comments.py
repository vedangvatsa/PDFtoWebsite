import json
import urllib.request
import ssl
import os
import sys
import time

context = ssl._create_unverified_context()
headers = {'User-Agent': 'CVinBioBot/1.0'}

dest_dir = '/Users/vedang/PDFtoWebsite/scratch'
os.makedirs(dest_dir, exist_ok=True)
dest_path = os.path.join(dest_dir, 'comments_context.txt')

req = urllib.request.Request('https://www.reddit.com/r/antiwork/top.json?t=year&limit=100', headers=headers)
try:
    print("Fetching top posts list...", flush=True)
    with urllib.request.urlopen(req, context=context, timeout=10) as response:
        data = json.load(response)
        posts = data['data']['children']
        
        count = 0
        with open(dest_path, 'w', encoding='utf-8') as f_out:
            for p in posts:
                d = p['data']
                url = d.get('url','')
                ups = d.get('ups',0)
                title = d.get('title','')
                has_img = ('i.redd.it' in url or 'i.imgur' in url) and not d.get('is_video')
                if not has_img or ups < 8000:
                    continue
                
                print(f"[{count:02d}] Fetching comments for: {title[:50]}...", flush=True)
                f_out.write(f'=== POST {count:02d} | Title: {title} | Ups: {ups} ===\n')
                f_out.write(f'Reddit URL: https://reddit.com{d.get("permalink", "")}\n')
                f_out.write(f'Selftext: {d.get("selftext", "")}\n\n')
                
                # Fetch comments for this post
                post_url = f'https://www.reddit.com{d.get("permalink", "")}.json'
                req_comments = urllib.request.Request(post_url, headers=headers)
                try:
                    # add a small sleep to avoid hitting rate limits too quickly
                    time.sleep(1)
                    with urllib.request.urlopen(req_comments, context=context, timeout=8) as res_comm:
                        res_data = json.load(res_comm)
                        comments = res_data[1]['data']['children']
                        f_out.write('Top Comments:\n')
                        for c in comments[:5]:
                            body = c['data'].get('body','')
                            author = c['data'].get('author','')
                            f_out.write(f'  [{author}]: {body[:400]}\n')
                            f_out.write('  ' + '-'*40 + '\n')
                except Exception as ex:
                    print(f"  Error fetching comments for post {count}: {ex}", flush=True)
                    f_out.write(f'  Error fetching comments: {ex}\n')
                
                f_out.write('\n' + '='*80 + '\n\n')
                f_out.flush() # Force flush to disk
                
                count += 1
                if count >= 30:
                    break
        print(f"Finished successfully! Wrote context to {dest_path}", flush=True)
except Exception as e:
    print('Fatal Error:', e, flush=True)
