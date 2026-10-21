"""제미나이 원본 → 골목 수호런(개금) 그림. python3 gaegeum/make_assets.py <원본 폴더>
반짝이 표시는 먼저 tools/unmark.py 로 지운 원본을 넣으세요."""
import sys, os
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

for f in ['bg_office', 'bg_market', 'bg_base', 'bg_end', 'flash1']:
    if J(f + '.png'): bg(f + '.png', f)
if J('portraits.png'):
    P = [('p_soon', (0, 0, 340, 340)), ('p_park', (340, 0, 680, 340)), ('p_miyoung', (680, 0, 1024, 340)),
         ('p_jiwoo', (0, 345, 340, 687)), ('p_kang', (340, 345, 680, 687)), ('p_police', (680, 345, 1024, 687))]
    for n, b in P: cut('portraits.png', b, n, 300)
if J('items.png'):
    w, h = 1024 // 4, 765 // 3
    names = ['i_letter', 'i_env', 'i_flash', 'i_key', 'i_fake', 'i_note', 'i_receipt', 'i_ledger', 'i_flour', 'i_doc', 'i_keys', 'i_photo']
    for i, n in enumerate(names):
        r, c = divmod(i, 4)
        cut('items.png', (c * w + 4, r * h + 4, (c + 1) * w - 4, (r + 1) * h - 4), n, 160)
