from PIL import Image, ImageDraw, ImageFont, ImageFilter
import random

W, H, S = 1080, 1350, 2
random.seed(30)
im = Image.new("RGB", (W*S, H*S), (8, 10, 33))
d = ImageDraw.Draw(im)
sc = lambda x: int(x*S)

for y in range(H*S):
    t = y/(H*S)
    a, b = (10,16,52), (48,16,75)
    d.line((0,y,W*S,y), fill=tuple(int(a[i]*(1-t)+b[i]*t) for i in range(3)))
for _ in range(170):
    x, y = random.randrange(W*S), random.randrange(H*S)
    r = random.choice((1,1,2,3))
    d.ellipse((x-r,y-r,x+r,y+r), fill=random.choice(((110,145,210),(240,203,102),(90,220,247))))

glow = Image.new("RGBA", im.size, (0,0,0,0))
gd = ImageDraw.Draw(glow)
gd.ellipse((sc(230),sc(130),sc(850),sc(820)), fill=(89,61,194,95))
glow = glow.filter(ImageFilter.GaussianBlur(sc(80)))
im = Image.alpha_composite(im.convert("RGBA"), glow)
d = ImageDraw.Draw(im)

# The same dark fantasy tower silhouette, but the campaign is about fire reactions.
d.polygon([(0,700),(170,470),(310,670),(430,520),(560,700),(0,800)], fill=(18,27,75,255))
d.polygon([(1080,700),(920,450),(800,650),(670,500),(540,700),(1080,800)], fill=(18,27,75,255))
body = [(355,1010),(390,560),(450,560),(472,400),(505,400),(540,250),(575,400),(610,400),(630,560),(690,560),(725,1010)]
d.polygon([(sc(x),sc(y)) for x,y in body], fill=(24,31,79,255), outline=(255,210,87,255), width=sc(5))
for x in (320,690):
    d.rectangle((sc(x),sc(550),sc(x+70),sc(1010)), fill=(30,35,86,255), outline=(218,177,83,255), width=sc(4))
    d.polygon([(sc(x-16),sc(555)),(sc(x+35),sc(455)),(sc(x+86),sc(555))], fill=(48,39,105,255), outline=(255,205,82,255), width=sc(4))
for y in (450,580,720,860,980):
    d.line((sc(390),sc(y),sc(690),sc(y)), fill=(99,95,152,255), width=sc(4))
for x,y in ((445,600),(505,600),(565,600),(625,600),(450,740),(510,740),(570,740),(630,740),(480,880),(545,880),(610,880)):
    d.rounded_rectangle((sc(x),sc(y),sc(x+24),sc(y+52)), radius=sc(8), fill=(255,206,77,255), outline=(255,241,177,255), width=sc(2))
    d.rectangle((sc(x+10),sc(y),sc(x+14),sc(y+52)), fill=(145,76,47,255))
d.rounded_rectangle((sc(500),sc(850),sc(580),sc(1010)), radius=sc(34), fill=(10,12,37,255), outline=(75,222,255,255), width=sc(5))

# Flame-like streaks.
for _ in range(28):
    x = random.randint(150, 930)
    y = random.randint(580, 1040)
    length = random.randint(18, 60)
    d.line((sc(x),sc(y),sc(x),sc(y-length)), fill=random.choice(((255,120,40,230),(255,53,83,230),(255,205,80,210))), width=sc(random.choice((2,3,4))))

bold = lambda n: ImageFont.truetype("C:/Windows/Fonts/arialbd.ttf", sc(n))
regular = lambda n: ImageFont.truetype("C:/Windows/Fonts/arial.ttf", sc(n))

d.rounded_rectangle((sc(54),sc(38),sc(1026),sc(205)), radius=sc(30), fill=(8,12,35,244), outline=(255,204,71,255), width=sc(4))
d.text((sc(540),sc(51)),"30 РЕАКЦИЙ",font=bold(82),fill=(255,215,89,255),anchor="mt",stroke_width=sc(2),stroke_fill=(76,34,101,255))
d.text((sc(540),sc(145)),"ПРОМОКОД НА 30 ПРОКРУТОК",font=bold(31),fill=(231,242,255,255),anchor="mt")

d.rounded_rectangle((sc(76),sc(390),sc(1004),sc(800)), radius=sc(30), fill=(8,12,35,246), outline=(255,102,54,255), width=sc(5))
d.text((sc(540),sc(414)),"ПОСТАВЬ ОГОНЁК ПОД ПОСТОМ",font=bold(35),fill=(255,221,116,255),anchor="mt")
d.text((sc(540),sc(472)),"Бот сам посчитает реакции",font=regular(26),fill=(240,244,255,255),anchor="mt")
d.text((sc(540),sc(513)),"и выложит промокод в канал",font=regular(26),fill=(240,244,255,255),anchor="mt")
d.line((sc(135),sc(575),sc(945),sc(575)), fill=(255,204,71,220), width=sc(3))
d.text((sc(540),sc(604)),"30 РЕАКЦИЙ",font=bold(58),fill=(255,102,54,255),anchor="mt")
d.text((sc(540),sc(680)),"30 ПРОКРУТОК",font=bold(46),fill=(255,215,89,255),anchor="mt")
d.text((sc(540),sc(747)),"ТОЛЬКО ПЕРВЫЕ 20 АКТИВАЦИЙ",font=bold(23),fill=(255,221,116,255),anchor="mt")

d.rounded_rectangle((sc(85),sc(1194),sc(995),sc(1307)), radius=sc(25), fill=(8,12,35,246), outline=(255,204,71,255), width=sc(4))
d.text((sc(540),sc(1209)),"ПОСТ ВЫЙДЕТ В 10:30",font=bold(25),fill=(255,221,116,255),anchor="mt")
d.text((sc(540),sc(1255)),"@voinyepoh · ВОИНЫ ЭПОХ",font=bold(21),fill=(231,242,255,255),anchor="mt")

im.convert("RGB").resize((W,H),Image.Resampling.LANCZOS).save("event-assets/reactions-2026-11-25.png", optimize=True)
print("saved reaction poster 1080x1350")
