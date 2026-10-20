"""제미나이 그림 오른쪽 아래의 반짝이 표시를 주변 그림으로 메워 지웁니다.
python3 tools/unmark.py 그림파일... (자리는 그림 크기에 맞춰 오른쪽 아래로 잡음)"""
import sys, cv2, numpy as np

def star(cx, cy, r, n=48):
    """제미나이 반짝이 모양(오목한 네 꼭짓점 별) 다각형"""
    pts = []
    for k in range(n):
        t = 2 * np.pi * k / n
        c, si = np.cos(t), np.sin(t)
        q = (abs(c) ** 0.5 + abs(si) ** 0.5) ** -2   # 아스트로이드처럼 오목한 별
        pts.append((cx + r * q * c * 1.0, cy + r * q * si))
    return np.array(pts, np.int32)

def unmark(path, center=None, r=None, out=None):
    im = cv2.imread(path, cv2.IMREAD_UNCHANGED)
    h, w = im.shape[:2]
    s = w / 1024
    cx, cy = center or (w - 86 * s, h - 89 * s)
    r = r or 44 * s
    m = np.zeros((h, w), np.uint8)
    cv2.fillPoly(m, [star(cx, cy, r)], 255)
    m = cv2.dilate(m, np.ones((3, 3), np.uint8), 2)
    rgb = np.ascontiguousarray(im[..., :3])
    im[..., :3] = cv2.inpaint(rgb, m, 4, cv2.INPAINT_TELEA)
    ext = path.lower().rsplit('.', 1)[-1]
    cv2.imwrite(out or path, im, [cv2.IMWRITE_JPEG_QUALITY, 88] if ext in ('jpg', 'jpeg') else [])
    return int(m.sum() / 255)

if __name__ == '__main__':
    for f in sys.argv[1:]: print(f, unmark(f))
