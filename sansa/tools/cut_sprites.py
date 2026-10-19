"""제미나이 원본(초록/자홍 단색 배경)에서 배경을 지우고 프레임·물체별로 잘라 sansa/sprites 에 저장합니다.
사용: python3 sansa/tools/cut_sprites.py <원본 폴더>
"""
import sys, os
import numpy as np
from PIL import Image
from scipy import ndimage

RAW = sys.argv[1] if len(sys.argv) > 1 else 'raw'
OUT = os.path.join(os.path.dirname(__file__), '..', 'sprites')


def key(path, crop=None):
    im = Image.open(path).convert('RGB')
    if crop: im = im.crop(crop)
    a = np.asarray(im).astype(np.float32)
    h, w, _ = a.shape
    corners = np.concatenate([a[:6, :6].reshape(-1, 3), a[:6, -6:].reshape(-1, 3), a[-6:, :6].reshape(-1, 3), a[-6:, -6:].reshape(-1, 3)])
    bg = np.median(corners, axis=0)
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    if bg[1] > bg[0] and bg[1] > bg[2]:            # 초록 배경
        spill = g - np.maximum(r, b)
        alpha = np.clip(1 - (spill - 40) / 60, 0, 1)
        g2 = np.where(spill > 0, np.maximum(r, b) + np.clip(spill, 0, 18), g)
        a[..., 1] = np.where(alpha < 1, np.minimum(g, g2), g)
    else:                                          # 자홍 배경
        spill = np.minimum(r, b) - g
        alpha = np.clip(1 - (spill - 50) / 60, 0, 1)
        lim = g + np.clip(spill, 0, 18)
        a[..., 0] = np.where(alpha < 1, np.minimum(r, np.maximum(lim, g)), r)
        a[..., 2] = np.where(alpha < 1, np.minimum(b, np.maximum(lim, g)), b)
    rgba = np.dstack([a, alpha * 255]).clip(0, 255).astype(np.uint8)
    return rgba


def parts(rgba, n=None, min_frac=0.02, gap=6):
    """알파가 있는 덩어리를 가로로 묶어 물체(프레임)별 bbox 반환. 아주 작은 덩어리(워터마크 반짝이)는 버림."""
    m = rgba[..., 3] > 40
    lab, k = ndimage.label(m)
    objs = ndimage.find_objects(lab)
    areas = ndimage.sum(m, lab, range(1, k + 1))
    big = max(areas) if k else 0
    comps = [(objs[i], areas[i]) for i in range(k) if areas[i] >= big * min_frac]
    # 작은 덩어리 중에서도 큰 덩어리 옆에 붙은(빗방울 등) 것은 살림
    keep = []
    for sl, ar in comps: keep.append([sl[1].start, sl[1].stop, sl[0].start, sl[0].stop, ar])
    keep.sort()
    groups = []
    for x0, x1, y0, y1, ar in keep:
        if groups and x0 <= groups[-1][1] + gap:
            gx = groups[-1]; gx[1] = max(gx[1], x1); gx[2] = min(gx[2], y0); gx[3] = max(gx[3], y1); gx[4] += ar
        else:
            groups.append([x0, x1, y0, y1, ar])
    if n and len(groups) > n:
        groups = sorted(sorted(groups, key=lambda g: -g[4])[:n])
    # 버린 덩어리는 투명하게
    clean = rgba.copy()
    allowed = np.zeros(k + 1, bool)
    for i in range(k):
        x0, x1 = objs[i][1].start, objs[i][1].stop
        if areas[i] >= big * min_frac and any(x0 >= g[0] - 1 and x1 <= g[1] + 1 for g in groups): allowed[i + 1] = True
    clean[..., 3] = np.where(allowed[lab] | (~m & (rgba[..., 3] > 0)), rgba[..., 3], 0)
    # 떨어진 반투명 찌꺼기(알파 40 이하) 중 물체에서 먼 것도 지움
    near = ndimage.binary_dilation(allowed[lab], iterations=3)
    clean[..., 3] = np.where(near, clean[..., 3], 0)
    return clean, [(g[0], g[2], g[1], g[3]) for g in groups]


def save_frames(name, path, n, crop=None, flip=False, extend_top=0):
    rgba, boxes = parts(key(path, crop), n)
    W = max(b[2] - b[0] for b in boxes) + 4
    H = max(b[3] - b[1] for b in boxes) + 4
    out = []
    for i, (x0, y0, x1, y1) in enumerate(boxes):
        fr = Image.fromarray(rgba[y0:y1, x0:x1])
        if flip: fr = fr.transpose(Image.FLIP_LEFT_RIGHT)
        c = Image.new('RGBA', (W, H), (0, 0, 0, 0))
        c.paste(fr, ((W - fr.width) // 2, H - fr.height - 2))
        out.append(c)
    return out


def tight(img):
    bb = img.getbbox(); return img.crop(bb) if bb else img


def extend_up(img, px):
    """맨 윗줄을 위로 늘려 매달린 줄·가지가 화면 위까지 이어지게."""
    img = tight(img)
    top = img.crop((0, 0, img.width, 1)).resize((img.width, px))
    c = Image.new('RGBA', (img.width, img.height + px), (0, 0, 0, 0))
    c.paste(top, (0, 0)); c.paste(img, (0, px), img)
    return c


os.makedirs(OUT, exist_ok=True)
p = lambda f: os.path.join(RAW, f)
for rid in ['dongja', 'young', 'old', 'turtle', 'rabbit', 'deer', 'spirit']:
    frs = save_frames(rid, p('r_' + rid + '.png'), 4)
    for i, f in enumerate(frs): f.save(os.path.join(OUT, f'r_{rid}_{i+1}.png'))
    print(rid, len(frs), frs[0].size)

sl = save_frames('slide', p('g_slide.png'), 2)
sl[0].save(os.path.join(OUT, 'g_slide.png')); print('slide', sl[0].size)

it = save_frames('items', p('items.png'), 3, crop=(0, 0, 1024, 250))
tight(it[0]).save(os.path.join(OUT, 'i_coupon.png'))
tight(it[1]).save(os.path.join(OUT, 'i_drink.png'))
tight(it[2]).transpose(Image.FLIP_LEFT_RIGHT).save(os.path.join(OUT, 'r_rabbit_nap.png'))
print('items', [tight(x).size for x in it])

ob = save_frames('obs', p('obstacles.png'), 6)
for nm, f in zip(['o_rock', 'o_log', 'o_boulder', 'o_tower', 'o_lantern_stone', 'o_cloud'], ob):
    tight(f).save(os.path.join(OUT, nm + '.png'))
print('obs', [tight(x).size for x in ob])

def strip_rim(img, px=3):
    """스티커처럼 둘러진 흰 테두리를 바깥에서부터 벗겨 냄."""
    a = np.asarray(img).copy()
    for _ in range(px):
        al = a[..., 3] > 20
        edge = al & ~ndimage.binary_erosion(al)
        c = a[..., :3].astype(int)
        white = (c[..., 0] > 195) & (c[..., 2] > 195) & (c[..., 1] > 165)   # 흰색(자홍이 살짝 비친 흰색 포함)
        a[..., 3] = np.where(edge & white, 0, a[..., 3])
    return Image.fromarray(a)


fl = save_frames('float', p('float.png'), 4, crop=(0, 0, 1024, 252))
names = ['o_banana', 'o_bees', 'o_lotus_float', 'o_storm']
for nm, f in zip(names, fl):
    tight(strip_rim(f, 7)).save(os.path.join(OUT, nm + '.png'))
print('float', [tight(x).size for x in fl])
for old in ['o_branch.png', 'o_lantern_hang.png', 'o_log.png']:
    if os.path.exists(os.path.join(OUT, old)): os.remove(os.path.join(OUT, old))


def outline(img, dark=4, light=4):
    img = tight(img); pad = dark + light + 2
    c = Image.new('RGBA', (img.width + pad * 2, img.height + pad * 2), (0, 0, 0, 0)); c.paste(img, (pad, pad), img)
    a = np.asarray(c).copy(); m = a[..., 3] > 40
    m1 = ndimage.binary_dilation(m, iterations=dark); m2 = ndimage.binary_dilation(m1, iterations=light)
    out = np.zeros_like(a)
    out[m2] = (255, 240, 205, 235); out[m1] = (58, 35, 15, 255)
    base = Image.fromarray(out); base.alpha_composite(c)
    return base


for nm in ['o_tower', 'o_lantern_stone']:
    pth = os.path.join(OUT, nm + '.png')
    outline(Image.open(pth).convert('RGBA')).save(pth)
print('outlined temple obstacles')
