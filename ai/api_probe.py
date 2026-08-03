#!/usr/bin/env python3
import json, os, sys, urllib.error, urllib.request
key=os.environ['OPENAI_API_KEY']
payload={"model":os.getenv("TEXT_MODEL","gpt-5-mini"),"messages":[{"role":"user","content":"Reply with exactly OK"}],"max_completion_tokens":20}
req=urllib.request.Request('https://api.openai.com/v1/chat/completions',data=json.dumps(payload).encode(),headers={'Authorization':f'Bearer {key}','Content-Type':'application/json'})
try:
    with urllib.request.urlopen(req,timeout=60) as r:
        data=json.load(r)
        print('OpenAI preflight succeeded:',data['choices'][0]['message']['content'])
except urllib.error.HTTPError as e:
    body=e.read().decode('utf-8','replace')
    print(f'OpenAI preflight failed HTTP {e.code}: {body}',file=sys.stderr)
    raise SystemExit(2)
