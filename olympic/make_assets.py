"""제미나이 원본 → 수호 올림픽 그림. python3 olympic/make_assets.py <원본 폴더>"""
import sys, os
from PIL import Image
here = os.path.dirname(os.path.abspath(__file__))
RAWDIR = sys.argv[1] if len(sys.argv) > 1 else 'raw'
sys.argv = [sys.argv[0], RAWDIR]
exec(open(os.path.join(here, '..', 'sansa', 'tools', 'cut_sprites.py')).read().split('os.makedirs')[0])
OUT = os.path.join(here, 'img'); R = lambda f: os.path.join(RAWDIR, f); J = lambda f: os.path.exists(R(f))
def bg(src, name, size=(1280, 715)):
    im = Image.open(R(src)).convert('RGB'); im = im.crop((0, 0, im.width - 2, im.height - 1))
    im.resize(size, Image.LANCZOS).save(os.path.join(OUT, name + '.jpg'), quality=86); print(name)
def cut(src, box, name, H):
    im = Image.open(R(src)).convert('RGB').crop(box); tmp = R('_t.png'); im.save(tmp)
    f = tight(save_frames('x', tmp, 1)[0]); k = H / f.height
    f = f.resize((round(f.width * k), H), Image.LANCZOS); f.save(os.path.join(OUT, name + '.png')); print(name, f.size)
for f in ['bg_track', 'bg_eomuk', 'bg_park', 'bg_podium']:
    if J(f + '.png'): bg(f + '.png', f)
if J('suho_poses.png'):
    w, h = 1024 // 3, 572 // 2
    for i, n in enumerate(['s_wind', 's_throw', 's_skewer', 's_torryeom', 's_cheer', 's_tired']):
        r, c = divmod(i, 3); cut('suho_poses.png', (c * w + 4, r * h + 4, (c + 1) * w - 4, (r + 1) * h - 4), n, 300)
if J('props.png'):
    w, h = 1024 // 4, 765 // 3
    for i, n in enumerate(['p_piece', 'p_stick', 'p_skewer', 'p_bowl', 'p_ladle', 'p_balloon', 'p_balloon_red', 'p_disc', 'm_gold', 'm_silver', 'm_bronze', 'm_trophy']):
        r, c = divmod(i, 4); cut('props.png', (c * w + 4, r * h + 4, (c + 1) * w - 4, (r + 1) * h - 4), n, 160)
