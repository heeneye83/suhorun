"""오프닝 그림: 반짝이 표시 지우고 1280×715 jpg로. python3 tools/op_img.py 원본.png 출력.jpg [dark]"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from unmark import unmark
from PIL import Image
src, out = sys.argv[1], sys.argv[2]
tmp = out + '.tmp.png'
Image.open(src).convert('RGB').save(tmp)
unmark(tmp, r=44 if len(sys.argv) > 3 else 28)
im = Image.open(tmp).convert('RGB'); im = im.crop((0, 0, im.width - 2, im.height - 1))
im.resize((1280, 715), Image.LANCZOS).save(out, quality=86); os.remove(tmp); print(out)
