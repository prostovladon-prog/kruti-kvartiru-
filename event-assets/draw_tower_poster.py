from PIL import Image, ImageDraw, ImageFont, ImageFilter
import random

W, H, S = 1080, 1350, 2
random.seed(25)
im = Image.new("RGB", (W*S, H*S), (8, 10, 33))
d = ImageDraw.Draw(im)
sc = lambda x: int(x*S)

for y in range(H*S):
    t = y/(H*S)
    a, b = (10, 16, 52), (48, 16, 75)
    d.line((0, y, W*S, y), fill=tuple(int(a[i]*(1-t)+b[i]*t) for i in range(3)))
for _ in range(200):
    x, y = random.randrange(W*S), random.randrange(H*S)
    r = random.choice((1, 1, 2, 3))
    d.ellipse((x-r, y-r, x+r, y+r), fill=random.choice(((110,145,210),(240,203,102),(90,220,247))))

glow = Image.new("RGBA", im.size, (0,0,0,0))
gd = ImageDraw.Draw(glow)
gd.ellipse((sc(230),sc(130),sc(850),sc(770)), fill=(89,61,194,90))
glow = glow.filter(ImageFilter.GaussianBlur(sc(80)))
im = Image.alpha_composite(im.convert("RGBA"), glow)
d = ImageDraw.Draw(im)

# Distant mountain silhouettes and a glowing tower.
d.polygon([(0,650),(150,430),(280,620),(420,490),(540,670),(0,760)], fill=(18,27,75,255))
d.polygon([(1080,650),(930,420),(810,610),(680,470),(540,670),(1080,760)], fill=(18,27,75,255))
body = [(355,950),(390,530),(450,530),(472,370),(505,370),(540,220),(575,370),(610,370),(630,530),(690,530),(725,950)]
d.polygon([(sc(x),sc(y)) for x,y in body], fill=(24,31,79,255), outline=(255,210,87,255), width=sc(5))
for x in (320,690):
    d.rectangle((sc(x),sc(520),sc(x+70),sc(950)), fill=(30,35,86,255), outline=(218,177,83,255), width=sc(4))
    d.polygon([(sc(x-16),sc(525)),(sc(x+35),sc(425)),(sc(x+86),sc(525))], fill=(48,39,105,255), outline=(255,205,82,255), width=sc(4))
for y in (420,550,690,825,940):
    d.line((sc(390),sc(y),sc(690),sc(y)), fill=(99,95,152,255), width=sc(4))
for x,y in ((445,575),(505,575),(565,575),(625,575),(450,710),(510,710),(570,710),(630,710),(480,845),(545,845),(610,845)):
    d.rounded_rectangle((sc(x),sc(y),sc(x+24),sc(y+52)), radius=sc(8), fill=(255,206,77,255), outline=(255,241,177,255), width=sc(2))
    d.rectangle((sc(x+10),sc(y),sc(x+14),sc(y+52)), fill=(145,76,47,255))
d.rounded_rectangle((sc(500),sc(825),sc(580),sc(950)), radius=sc(34), fill=(10,12,37,255), outline=(75,222,255,255), width=sc(5))
for j in range(4):
    d.arc((sc(170-j*24),sc(875-j*14),sc(910+j*24),sc(1130+j*14)), 180, 355, fill=(80,220,255,145-j*22), width=sc(4))
for _ in range(14):
    y = random.randint(350,900)
    x = random.choice((random.randint(200,335),random.randint(745,880)))
    d.line((sc(x),sc(y),sc(x+random.randint(25,120)),sc(y)), fill=random.choice(((255,55,105,210),(75,226,255,210),(255,208,80,190))), width=sc(3))

bold = lambda n: ImageFont.truetype("C:/Windows/Fonts/arialbd.ttf", sc(n))
regular = lambda n: ImageFont.truetype("C:/Windows/Fonts/arial.ttf", sc(n))

def card(cx, cy, title, accent, rotation):
    w,h = 210,330
    c = Image.new("RGBA",(sc(w),sc(h)),(0,0,0,0))
    q = ImageDraw.Draw(c)
    q.rounded_rectangle((2,2,sc(w)-3,sc(h)-3), radius=sc(18), fill=(13,17,43,250), outline=accent, width=sc(5))
    q.rounded_rectangle((sc(12),sc(12),sc(w-12),sc(h-12)), radius=sc(13), outline=(235,222,189,190), width=sc(2))
    q.rounded_rectangle((sc(15),sc(15),sc(w-15),sc(54)), radius=sc(10), fill=(25,28,69,255))
    q.text((sc(w/2),sc(21)), title, font=bold(12), fill=(255,240,200,255), anchor="mt")
    q.rounded_rectangle((sc(20),sc(64),sc(w-20),sc(h-88)), radius=sc(12), fill=(26,31,76,255), outline=accent, width=sc(3))
    ax, ay = w/2, 150
    for r in (45,62,78):
        q.ellipse((sc(ax-r),sc(ay-r),sc(ax+r),sc(ay+r)), outline=(*accent[:3],130), width=sc(2))
    q.ellipse((sc(ax-31),sc(ay-37),sc(ax+31),sc(ay+25)), fill=(214,182,143,255), outline=(255,224,155,255), width=sc(3))
    q.polygon([(sc(ax-42),sc(ay-18)),(sc(ax-28),sc(ay-60)),(sc(ax+4),sc(ay-44)),(sc(ax+33),sc(ay-57)),(sc(ax+42),sc(ay-13))], fill=accent, outline=(255,237,180,255))
    q.rounded_rectangle((sc(ax-50),sc(ay+21),sc(ax+50),sc(ay+105)), radius=sc(22), fill=(46,55,99,255), outline=accent, width=sc(3))
    q.line((sc(ax),sc(ay+30),sc(ax),sc(ay+96)), fill=(255,224,128,255), width=sc(4))
    q.rounded_rectangle((sc(18),sc(h-75),sc(w-18),sc(h-44)), radius=sc(10), fill=accent)
    q.text((sc(w/2),sc(h-70)),"МИФИЧЕСКИЙ",font=bold(12),fill=(15,16,39,255),anchor="mt")
    q.text((sc(w/2),sc(h-37)),"ОШИБКА ПЕЧАТИ · 1 ИЗ 1",font=bold(9),fill=(255,233,168,255),anchor="mt")
    c = c.rotate(rotation, resample=Image.Resampling.BICUBIC, expand=True)
    im.alpha_composite(c, (sc(cx)-c.width//2,sc(cy)-c.height//2))

card(265,1020,"СТРАЖ СУМЕРЕК",(79,226,255,255),-8)
card(815,1020,"ВЛАДЫКА БАШНИ",(255,72,130,255),8)
d = ImageDraw.Draw(im)
d.rounded_rectangle((sc(56),sc(42),sc(1024),sc(184)),radius=sc(30),fill=(8,12,35,240),outline=(255,204,71,255),width=sc(4))
d.text((sc(540),sc(58)),"БАШНЯ ИСПЫТАНИЙ",font=bold(68),fill=(255,215,89,255),anchor="mt",stroke_width=sc(2),stroke_fill=(76,34,101,255))
d.text((sc(540),sc(145)),"5 ЭТАЖЕЙ  ·  3 КАРТЫ  ·  ТУРНИР ТОП-6",font=bold(28),fill=(231,242,255,255),anchor="mt")
d.rounded_rectangle((sc(85),sc(1196),sc(995),sc(1307)),radius=sc(25),fill=(9,14,39,244),outline=(255,204,71,255),width=sc(4))
d.text((sc(540),sc(1208)),"2 БЕСПЛАТНЫХ ЗАБЕГА КАЖДЫЙ ДЕНЬ",font=bold(25),fill=(255,221,116,255),anchor="mt")
d.text((sc(540),sc(1252)),"КАРТЫ НЕ ТЕРЯЮТСЯ  ·  ИГРАЙ УЖЕ СЕГОДНЯ",font=regular(20),fill=(223,233,255,255),anchor="mt")
im.convert("RGB").resize((W,H),Image.Resampling.LANCZOS).save("event-assets/tower-launch-2026-11-25.png",optimize=True)
print("saved PNG 1080x1350")
