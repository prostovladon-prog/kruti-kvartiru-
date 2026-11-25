from PIL import Image, ImageDraw, ImageFont

source = "event-assets/tower-launch-2026-11-25.png"
output = "event-assets/friend-ticket-2026-11-25.png"
im = Image.open(source).convert("RGBA")
w, h = im.size
d = ImageDraw.Draw(im, "RGBA")
bold = lambda size: ImageFont.truetype("C:/Windows/Fonts/arialbd.ttf", size)
regular = lambda size: ImageFont.truetype("C:/Windows/Fonts/arial.ttf", size)

# Replace the tower launch heading with a contest heading.
d.rounded_rectangle((48, 34, w-48, 190), radius=28, fill=(8,12,35,246), outline=(255,204,71,255), width=4)
d.text((w//2, 48), "РОЗЫГРЫШ ЗА ДРУЗЕЙ", font=bold(55), fill=(255,215,89,255), anchor="mt", stroke_width=1, stroke_fill=(76,34,101,255))
d.text((w//2, 128), "25–26 НОЯБРЯ  •  ТРИ ПОБЕДИТЕЛЯ", font=bold(25), fill=(231,242,255,255), anchor="mt")

# Clear contest conditions and prizes over the central art.
d.rounded_rectangle((76, 500, w-76, 880), radius=28, fill=(8,12,35,242), outline=(79,226,255,255), width=4)
d.text((w//2, 520), "КАЖДЫЙ НОВЫЙ ДРУГ = 1 БИЛЕТ", font=bold(30), fill=(255,221,116,255), anchor="mt")
d.text((w//2, 567), "Друг должен открыть 20 карт и подписаться", font=regular(23), fill=(240,244,255,255), anchor="mt")
d.text((w//2, 600), "на канал @voinyepoh и чат @voinyepohchat", font=regular(23), fill=(240,244,255,255), anchor="mt")
d.line((122, 647, w-122, 647), fill=(255,204,71,220), width=2)
prizes = [
    ("1 МЕСТО", "700 ЗВЁЗД + VIP 7 ДНЕЙ"),
    ("2 МЕСТО", "500 ЗВЁЗД + VIP 7 ДНЕЙ"),
    ("3 МЕСТО", "300 ЗВЁЗД + VIP 7 ДНЕЙ"),
]
for i, (place, prize) in enumerate(prizes):
    y = 662 + i*55
    d.text((155, y), place, font=bold(22), fill=(255,215,89,255), anchor="lt")
    d.text((w-145, y), prize, font=bold(21), fill=(240,244,255,255), anchor="rt")

d.text((w//2, 824), "ИТОГИ 26 НОЯБРЯ В 22:00 • МИНСКОЕ ВРЕМЯ", font=bold(18), fill=(255,221,116,255), anchor="mt")
d.rounded_rectangle((85, 1196, w-85, 1307), radius=25, fill=(8,12,35,246), outline=(255,204,71,255), width=4)
d.text((w//2, 1211), "СТАРТ 25 НОЯБРЯ · 08:00", font=bold(24), fill=(255,221,116,255), anchor="mt")
d.text((w//2, 1255), "ФИНИШ 26 НОЯБРЯ · 22:00 · МИНСК", font=bold(22), fill=(231,242,255,255), anchor="mt")
im.convert("RGB").save(output, quality=94, optimize=True)
print(output, im.size)
