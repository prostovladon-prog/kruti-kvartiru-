from PIL import Image, ImageDraw, ImageFont, ImageFilter
import random

W, H, S = 1080, 1350, 2
random.seed(2025)
im = Image.new("RGB", (W*S, H*S), (8, 10, 33))
d = ImageDraw.Draw(im)
sc = lambda x: int(x*S)

for y in range(H*S):
    t = y/(H*S)
    a, b = (9,13,44), (58,14,62)
    d.line((0,y,W*S,y), fill=tuple(int(a[i]*(1-t)+b[i]*t) for i in range(3)))
for _ in range(200):
    x, y = random.randrange(W*S), random.randrange(H*S)
    r = random.choice((1,1,2,3))
    d.ellipse((x-r,y-r,x+r,y+r), fill=random.choice(((110,145,210),(240,203,102),(90,220,247),(255,110,60))))

glow = Image.new("RGBA", im.size, (0,0,0,0))
gd = ImageDraw.Draw(glow)
gd.ellipse((sc(170),sc(120),sc(910),sc(860)), fill=(114,38,190,105))
gd.ellipse((sc(360),sc(430),sc(720),sc(980)), fill=(255,90,26,70))
glow = glow.filter(ImageFilter.GaussianBlur(sc(90)))
im = Image.alpha_composite(im.convert("RGBA"), glow)
d = ImageDraw.Draw(im)

# arena / tower silhouette
d.polygon([(0,760),(150,510),(300,720),(430,560),(560,750),(0,840)], fill=(16,24,70,255))
d.polygon([(1080,760),(930,490),(800,710),(670,540),(540,750),(1080,840)], fill=(16,24,70,255))
body = [(365,1030),(395,585),(452,585),(474,430),(505,430),(540,270),(575,430),(606,430),(628,585),(685,585),(715,1030)]
d.polygon([(sc(x),sc(y)) for x,y in body], fill=(23,29,76,255), outline=(255,210,87,255), width=sc(5))
for x in (325,690):
    d.rectangle((sc(x),sc(570),sc(x+68),sc(1030)), fill=(28,32,82,255), outline=(218,177,83,255), width=sc(4))
    d.polygon([(sc(x-18),sc(575)),(sc(x+34),sc(470)),(sc(x+86),sc(575))], fill=(47,35,100,255), outline=(255,205,82,255), width=sc(4))
for y in (470,600,740,880,1000):
    d.line((sc(395),sc(y),sc(685),sc(y)), fill=(99,95,152,255), width=sc(4))
for x,y in ((440,620),(500,620),(560,620),(620,620),(445,760),(505,760),(565,760),(625,760),(475,900),(540,900),(605,900)):
    d.rounded_rectangle((sc(x),sc(y),sc(x+24),sc(y+52)), radius=sc(8), fill=(255,206,77,255), outline=(255,241,177,255), width=sc(2))
    d.rectangle((sc(x+10),sc(y),sc(x+14),sc(y+52)), fill=(145,76,47,255))
d.rounded_rectangle((sc(495),sc(870),sc(585),sc(1030)), radius=sc(36), fill=(10,12,37,255), outline=(122,216,255,255), width=sc(6))

# crossed swords
for k,(x1,y1,x2,y2) in enumerate(((300,560,470,760),(780,560,610,760))):
    d.line((sc(x1),sc(y1),sc(x2),sc(y2)), fill=(226,236,255,255), width=sc(9))
    d.line((sc(x1),sc(y1),sc(x2),sc(y2)), fill=(255,210,87,255), width=sc(3))
    d.ellipse((sc(x1-16),sc(y1-16),sc(x1+16),sc(y1+16)), fill=(255,210,87,255))

bold = lambda n: ImageFont.truetype("C:/Windows/Fonts/arialbd.ttf", sc(n))
regular = lambda n: ImageFont.truetype("C:/Windows/Fonts/arial.ttf", sc(n))

d.rounded_rectangle((sc(48),sc(30),sc(1032),sc(214)), radius=sc(32), fill=(8,12,35,246), outline=(255,204,71,255), width=sc(5))
d.text((sc(540),sc(43)),"АРЕНА 20:30",font=bold(92),fill=(255,215,89,255),anchor="mt",stroke_width=sc(3),stroke_fill=(74,20,74,255))
d.text((sc(540),sc(153)),"ТУРНИР НА 30 МЕСТ · ВХОД В 20:30",font=bold(29),fill=(231,242,255,255),anchor="mt")

d.rounded_rectangle((sc(66),sc(300),sc(1014),sc(522)), radius=sc(30), fill=(8,12,35,246), outline=(255,90,26,255), width=sc(5))
d.text((sc(540),sc(322)),"ПЕРВЫЕ 30 — В СЕТКЕ",font=bold(42),fill=(255,221,116,255),anchor="mt")
d.text((sc(540),sc(383)),"СТОЙКА + ЗАГАДКА + 3 РАУНДА",font=bold(31),fill=(255,120,70,255),anchor="mt")
d.text((sc(540),sc(432)),"Правильный ответ +25% · стойка +15%",font=regular(25),fill=(240,244,255,255),anchor="mt")
d.text((sc(540),sc(480)),"МИНИМУМ 20 · ЕСЛИ 30 НЕ НАБЕРЁТСЯ — СТАРТ В 20:45",font=bold(19),fill=(255,221,116,255),anchor="mt")

d.rounded_rectangle((sc(90),sc(780),sc(990),sc(1056)), radius=sc(28), fill=(8,12,35,248), outline=(255,204,71,255), width=sc(4))
d.text((sc(540),sc(798)),"НАГРАДЫ",font=bold(30),fill=(255,221,116,255),anchor="mt")
d.text((sc(540),sc(844)),"1 МЕСТО · 200 ЗВЁЗД + VIP 7 ДНЕЙ + 3 КЛЮЧА",font=bold(26),fill=(255,215,89,255),anchor="mt")
d.text((sc(540),sc(896)),"2 МЕСТО · 100 ЗВЁЗД + VIP 3 ДНЯ + 2 КЛЮЧА",font=bold(25),fill=(231,242,255,255),anchor="mt")
d.text((sc(540),sc(944)),"3 МЕСТО · 50 ЗВЁЗД + 1 КЛЮЧ",font=bold(25),fill=(231,242,255,255),anchor="mt")
d.text((sc(540),sc(998)),"ВСЕМ УЧАСТНИКАМ — ПРОКРУТКИ И ОСКОЛКИ",font=regular(22),fill=(200,212,245,255),anchor="mt")

d.rounded_rectangle((sc(85),sc(1194),sc(995),sc(1307)), radius=sc(25), fill=(8,12,35,246), outline=(255,204,71,255), width=sc(4))
d.text((sc(540),sc(1209)),"ИГРА → БАШНЯ → АРЕНА",font=bold(26),fill=(255,221,116,255),anchor="mt")
d.text((sc(540),sc(1255)),"@voinyepoh · ВОИНЫ ЭПОХ",font=bold(21),fill=(231,242,255,255),anchor="mt")

im.convert("RGB").resize((W,H),Image.Resampling.LANCZOS).save("event-assets/arena-2026-11-25.png", optimize=True)
print("saved arena poster 1080x1350")
