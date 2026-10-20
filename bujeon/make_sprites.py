"""제미나이 원본 → 게임용 스프라이트 시트. python3 bujeon/make_sprites.py <원본 폴더>
원본(초록/자홍 단색 배경)에서 배경을 지우고 프레임을 잘라, 신발거리 수호런과 같은 형식(가로로 n칸, 높이 H)으로 저장."""
import sys, os
import numpy as np
from PIL import Image
here = os.path.dirname(os.path.abspath(__file__))
sys.argv = [sys.argv[0], sys.argv[1] if len(sys.argv) > 1 else 'raw']
__file__ = os.path.join(here, '..', 'sansa', 'tools', 'cut_sprites.py')
exec(open(__file__).read().split('os.makedirs')[0])   # key, parts, save_frames, tight
RAW = sys.argv[1]; OUT = os.path.join(here, 'sprites')

def frames(src, n, rows=1, row=0, crop=None):
    im = Image.open(os.path.join(RAW, src)).convert('RGB')
    if crop: im = im.crop(crop)
    a = np.asarray(im).astype(int).sum(2)
    cols = np.where((a < 60).mean(0) > 0.5)[0]; rows_ = np.where((a < 60).mean(1) > 0.5)[0]   # 캡처 오른쪽·아래 검은 띠
    x1 = cols[cols > im.width * 0.8].min() if (cols > im.width * 0.8).any() else im.width
    y1 = rows_[rows_ > im.height * 0.8].min() if (rows_ > im.height * 0.8).any() else im.height
    im = im.crop((3, 3, x1 - 4, y1 - 4))   # 캡처 가장자리 찌꺼기 제거
    if rows > 1:
        h = im.height / rows; im = im.crop((0, int(h * row), im.width, int(h * (row + 1))))
    tmp = os.path.join(RAW, '_tmp.png'); im.save(tmp)
    return [tight(f) for f in save_frames('x', tmp, n)]

def sheet(name, frs, H, flip=(), pad=6, order=None):
    if order: frs = [frs[i] for i in order]
    frs = [f.transpose(Image.FLIP_LEFT_RIGHT) if i in flip else f for i, f in enumerate(frs)]
    k = (H - pad) / max(f.height for f in frs)
    frs = [f.resize((max(1, round(f.width * k)), max(1, round(f.height * k))), Image.LANCZOS) for f in frs]
    cw = max(f.width for f in frs) + 8
    out = Image.new('RGBA', (cw * len(frs), H), (0, 0, 0, 0))
    for i, f in enumerate(frs): out.alpha_composite(f, (i * cw + (cw - f.width) // 2, H - 2 - f.height))
    out.save(os.path.join(OUT, name + '.png')); print(name, out.size)

def single(name, f, H, flip=False):
    if flip: f = f.transpose(Image.FLIP_LEFT_RIGHT)
    k = H / f.height; f.resize((round(f.width * k), H), Image.LANCZOS).save(os.path.join(OUT, name + '.png')); print(name, (round(f.width * k), H))

def _sv(rgba):
    p = os.path.join(RAW, '_fb.png'); Image.fromarray(rgba[..., :3]).save(p); return p

if __name__ == '__main__':
    J = lambda *a: os.path.exists(os.path.join(RAW, a[0]))
    if J('v_fat.png'): sheet('z_office', frames('v_fat.png', 2), 250, flip=(0, 1))
    if J('s_thin_litter.png'):
        sheet('z_ajumma', frames('s_thin_litter.png', 2, 2, 0), 250, flip=(1,))
        sheet('z_walk', frames('s_thin_litter.png', 2, 2, 1), 250, flip=(1,))
    if J('s_troll_nerd.png'):
        sheet('z_run', frames('s_troll_nerd.png', 4, 2, 0), 250, flip=(0, 1, 2, 3), order=[0, 2])
        sheet('z_ballet', frames('s_troll_nerd.png', 4, 2, 1), 250, flip=(0, 1, 2, 3), order=[0, 2])
    if J('s_thief_bear.png'):
        sheet('z_bball', frames('s_thief_bear.png', 2, 2, 0), 250, flip=(0, 1))
        sheet('z_bear', frames('s_thief_bear.png', 2, 2, 1), 280, flip=(0, 1))
    if J('s_tree.png'):
        im = Image.open(os.path.join(RAW, 's_tree.png')).convert('RGB'); im.paste((255, 0, 255), (430, 185, 530, 265)); im.save(os.path.join(RAW, '_tree.png'))
        fr = frames('_tree.png', 3)
        sheet('z_boss', fr, 300)
        # 솔방울: 셋째 칸 왼쪽의 작은 덩어리
        p = os.path.join(RAW, '_fb.png'); Image.open(os.path.join(RAW, 's_tree.png')).convert('RGB').crop((440, 190, 520, 260)).save(p)
        single('fireball', tight(save_frames('x', p, 1)[0]), 80)
    if J('s_tiger_dance.png'):
        T = lambda box: frames('s_tiger_dance.png', 1, crop=box)[0]
        sheet('z_wolf', [T((50, 10, 290, 125)), T((50, 128, 290, 240))], 150)
        sheet('z_dance', [T((320, 5, 520, 250)), T((800, 5, 1010, 250))], 250)
    if J('s_landlord.png'):
        im = Image.open(os.path.join(RAW, 's_landlord.png')).convert('RGB'); im.paste((255, 0, 255), (585, 110, 670, 170)); im.save(os.path.join(RAW, '_land.png'))
        L = lambda box: frames('_land.png', 1, crop=box)[0]
        sheet('z_gym', [L((0, 0, 200, 319)), L((195, 0, 400, 319)), L((395, 0, 600, 319)), L((600, 50, 818, 319)), L((818, 0, 1024, 319))], 300, flip=(0, 1, 2, 3, 4))
    if J('s_items.png'):
        I = lambda box: frames('s_items.png', 1, crop=box)[0]
        single('dumbbell', I((70, 30, 300, 270)), 80)
        single('it_candy', I((380, 20, 640, 280)), 220)
        single('ob_tires', I((740, 20, 940, 300)), 220)
        single('ob_cube', I((30, 310, 370, 550)), 140)
        single('ob_pipe', I((350, 340, 670, 530)), 150)
        single('ob_car', I((680, 340, 1010, 550)), 160)
    if J('s_kick.png'):
        im = Image.open(os.path.join(RAW, 's_kick.png')).convert('RGB')
        for b in [(275, 35, 395, 115), (265, 155, 395, 235), (928, 40, 1000, 108), (825, 140, 905, 220), (940, 170, 990, 215)]: im.paste((255, 0, 255), b)
        im.save(os.path.join(RAW, '_kick.png'))
        sheet('heli', frames('_kick.png', 2), 300, flip=(0, 1))
    if J('s_pumba.png'):
        P = lambda box: frames('s_pumba.png', 1, crop=box)[0]
        sheet('kingdj', [P((30, 30, 252, 540)), P((245, 70, 545, 540)), P((525, 100, 775, 540)), P((770, 90, 1015, 540))], 460)
    if J('s_catgull.png'):
        sheet('z_cat', frames('s_catgull.png', 2, 2, 0), 130)
        sheet('z_gull', frames('s_catgull.png', 2, 2, 1), 160)
