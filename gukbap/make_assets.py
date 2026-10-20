"""제미나이 원본 → 국밥 수호런 그림. python3 gukbap/make_assets.py <원본 폴더>"""
import sys, os
import numpy as np
from PIL import Image
here = os.path.dirname(os.path.abspath(__file__))
RAWDIR = sys.argv[1] if len(sys.argv) > 1 else 'raw'
sys.argv = [sys.argv[0], RAWDIR]
exec(open(os.path.join(here, '..', 'sansa', 'tools', 'cut_sprites.py')).read().split('os.makedirs')[0])   # key, parts, save_frames, tight
OUT = os.path.join(here, 'img')
R = lambda f: os.path.join(RAWDIR, f)
J = lambda f: os.path.exists(R(f))

def bg(src, name, size=(1280, 715)):
    im = Image.open(R(src)).convert('RGB')
    im = im.crop((0, 0, im.width - 2, im.height - 1))
    im.resize(size, Image.LANCZOS).save(os.path.join(OUT, name + '.jpg'), quality=86); print(name)

def cut(src, box, name, H):
    im = Image.open(R(src)).convert('RGB').crop(box); tmp = R('_t.png'); im.save(tmp)
    f = tight(save_frames('x', tmp, 1)[0]); k = H / f.height
    f = f.resize((round(f.width * k), H), Image.LANCZOS); f.save(os.path.join(OUT, name + '.png')); print(name, f.size)

if J('bg_kitchen.png'): bg('bg_kitchen.png', 'bg_kitchen')
if J('bg_alley.png'): bg('bg_alley.png', 'bg_alley')
if J('bg_roof.png'): bg('bg_roof.png', 'bg_roof')
for f in ['flash1', 'flash2', 'bg_end']:
    if J(f + '.png'): bg(f + '.png', f)
if J('portraits.png'):
    P = [('p_misuk', (0, 0, 340, 340)), ('p_minho', (340, 0, 680, 340)), ('p_choi', (680, 0, 1024, 340)),
         ('p_j', (0, 345, 380, 687)), ('p_yang', (380, 345, 700, 687))]
    for n, b in P: cut('portraits.png', b, n, 300)
if J('items.png'):
    w, h = 1024 // 4, 765 // 3
    names = ['i_flash', 'i_key', 'i_ledger', 'i_badge', 'i_screw', 'i_glove', 'i_receipt', 'i_phone', 'jar', 's_shrimp', 's_chive', 's_chili']
    for i, n in enumerate(names):
        r, c = divmod(i, 4)
        cut('items.png', (c * w + 4, r * h + 4, (c + 1) * w - 4, (r + 1) * h - 4), n, 260 if n == 'jar' else 160)
