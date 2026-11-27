"""Export the seven interchangeable knight layers from the aligned showcase art."""
from pathlib import Path
import argparse
from PIL import Image, ImageChops, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
ART = ROOT / "assets" / "kn"
LAYERS = ART / "layers"
SIZE = (640, 960)
OUTPUT = (1024, 1536)
SETS = "bronze iron steel moon sapph emer viking ruby frost obsid imper gold samurai legion bogatyr pharaoh drake champ glad banner laurel keeper flag".split()
ORDER = ("cape", "base_body", "legs", "boots", "chest", "weapon", "shoulders", "helm")
CAPES = dict(zip(SETS, (
    "#494e25", "#34333b", "#a3152b", "#134b55", "#222965", "#16542d", "#651f1b",
    "#68111b", "#152e59", "#3f184f", "#64151b", "#203994", "#51161c", "#812022",
    "#701921", "#182e77", "#304722", "#382454", "#701e22", "#771f1f",
    "#531c3c", "#152d50", "#6b1731",
)))
INK = "#131522"

def polygon(points):
    # Hand-traced source registration points are on the original 640x960 grid.
    high = Image.new("L", (SIZE[0] * 2, SIZE[1] * 2))
    ImageDraw.Draw(high).polygon([(x * 2, y * 2) for x, y in points], fill=255)
    return high.resize(SIZE, Image.Resampling.LANCZOS)

def mirror(points):
    return [(640 - x, y) for x, y in points]

def union(*masks):
    result = Image.new("L", SIZE)
    for mask in masks:
        result = ImageChops.lighter(result, mask)
    return result

def pairs(points):
    return union(polygon(points), polygon(mirror(points)))

def cut(source, mask):
    result = source.copy()
    result.putalpha(ImageChops.multiply(result.getchannel("A"), mask))
    return result

def blank():
    return Image.new("RGBA", SIZE)

def art(name):
    with Image.open(ART / (name + ".webp")) as image:
        return image.convert("RGBA").resize(SIZE, Image.Resampling.LANCZOS)

FACE = [(275,158),(292,153),(319,155),(347,153),(364,158),(364,219),(353,243),(334,261),(319,266),(301,258),(281,242),(273,218)]
FACE_OPENING = [(271,154),(288,148),(319,151),(349,148),(369,155),(370,222),
                (359,248),(339,267),(319,271),(299,265),(275,246),(267,223)]
TORSO = [(266,237),(246,250),(205,266),(180,311),(193,391),(218,477),(250,530),
         (252,565),(384,565),(390,530),(419,477),(447,390),(459,310),(432,267),(393,250),(374,237)]

# Different shoulder silhouettes are traced for the three reference sets.
SHOULDER = {
    "bronze": [(103,322),(113,286),(140,261),(174,244),(205,240),(232,247),(252,272),
               (262,302),(246,320),(232,354),(218,382),(206,414),(172,426),(134,431),
               (122,414),(127,387),(107,386),(114,358),(102,349)],
    "imper": [(83,317),(85,280),(117,234),(167,209),(211,204),(239,223),(262,265),
              (259,308),(244,334),(226,361),(221,394),(204,425),(170,451),(128,439),
              (129,413),(110,407),(116,376),(92,367),(106,341),(88,338)],
    "ruby": [(101,318),(107,268),(131,256),(128,237),(158,247),(159,218),(184,239),
             (203,214),(222,225),(244,249),(257,280),(259,317),(239,343),(223,376),
             (211,414),(173,429),(130,427),(118,405),(122,378),(108,360),(116,331)],
}
DEFAULT_SHOULDER = [(87,323),(98,272),(134,229),(169,199),(215,201),(249,225),(265,267),
                    (261,312),(244,332),(231,369),(216,403),(200,441),(163,450),
                    (130,438),(111,411),(105,379),(90,352)]
ARM = [(127,403),(174,397),(211,412),(218,459),(232,480),(275,491),(309,487),
       (323,508),(321,555),(305,574),(274,569),(236,552),(203,535),(172,513),
       (139,484),(126,454),(119,427)]
WEAPON = {
    "bronze": [(292,450),(302,440),(333,436),(348,450),(348,470),(337,476),(336,502),
               (326,507),(320,556),(340,590),(375,586),(402,599),(399,620),(345,626),
               (335,885),(322,933),(310,928),(297,885),(289,626),(238,621),(236,600),
               (251,588),(301,591),(307,557),(311,505),(302,500),(302,476),(290,465)],
    "imper": [(292,444),(308,434),(331,433),(348,445),(346,466),(335,471),(338,511),
              (320,522),(325,573),(353,577),(389,573),(406,587),(403,609),(341,623),
              (335,884),(320,956),(309,949),(298,879),(290,620),(236,610),(232,589),
              (251,576),(284,579),(306,567),(311,515),(301,501),(301,471),(290,461)],
    "viking": [(291,481),(311,465),(335,474),(350,492),(337,519),(338,764),
                (350,814),(369,838),(389,815),(398,846),(399,892),(386,933),
                (370,932),(345,923),(316,920),(283,925),(247,934),(232,908),
                (229,875),(235,847),(249,815),(264,832),(279,837),(294,819),
                (300,775),(301,522),(289,497)],
    "pharaoh": [(297,452),(308,437),(331,439),(343,456),(337,479),(334,505),
                 (335,562),(344,583),(379,597),(378,612),(359,625),(344,624),
                 (354,677),(360,747),(351,812),(332,869),(301,916),(270,941),
                 (257,936),(275,895),(287,843),(290,805),(305,795),(319,756),
                 (324,718),(322,675),(309,628),(297,620),(278,626),(258,615),
                 (259,598),(290,587),(302,565),(304,505),(300,480),(293,468)],
    "ruby": [(290,441),(307,422),(330,422),(349,439),(348,460),(338,465),(336,503),
             (323,519),(325,551),(347,566),(376,552),(397,563),(398,593),(382,617),
             (351,608),(351,646),(343,681),(354,718),(344,746),(359,786),(349,830),
             (340,850),(339,883),(322,941),(303,920),(290,879),(288,841),(278,810),
             (288,769),(278,728),(288,695),(278,662),(287,613),(264,610),(238,620),
             (234,583),(249,559),(288,568),(309,550),(311,505),(298,494),(300,466),(290,459)],
}
DEFAULT_WEAPON = [(294,432),(346,432),(352,469),(335,483),(337,517),(323,534),
                  (327,561),(363,565),(406,569),(409,610),(351,639),(347,877),
                  (321,953),(293,883),(289,639),(232,611),(231,575),(280,566),
                  (308,560),(312,524),(301,514),(302,479),(288,462)]
LEG = [(188,546),(236,548),(280,568),(292,615),(286,660),(276,700),(286,737),
       (270,766),(235,768),(198,768),(176,751),(171,719),(179,683),(164,677),
       (175,628),(155,626),(164,594)]
BOOT = [(194,748),(237,751),(257,746),(270,780),(264,826),(252,855),(249,887),
        (257,920),(244,933),(139,933),(133,914),(145,890),(163,870),(176,839),
        (177,802),(182,765)]
LEG_OVERRIDES = {
    "imper": [(175,552),(226,549),(279,576),(290,624),(282,668),(270,701),(282,737),
              (271,769),(228,781),(190,772),(169,746),(170,709),(180,686),(158,675),(172,613)],
    "ruby": [(177,549),(230,545),(276,571),(290,620),(279,661),(268,682),(278,712),
             (272,750),(258,775),(209,772),(173,749),(163,720),(173,686),(159,653),(169,614)],
}
BOOT_OVERRIDES = {
    "imper": [(184,751),(241,750),(266,748),(271,785),(261,826),(252,873),(257,919),
              (235,949),(139,949),(137,932),(152,899),(171,879),(183,850),(176,803)],
    "flag": [(189,759),(244,764),(265,755),(269,802),(262,851),(245,904),
              (254,959),(132,959),(140,937),(168,911),(181,873),(178,827),(181,786)],
    "viking": [(178,743),(249,746),(258,775),(252,803),(246,852),(237,886),(237,930),
                (136,935),(133,917),(144,888),(147,860),(131,828),(141,798),(159,784)],
    "ruby": [(191,748),(237,752),(265,750),(270,783),(260,812),(251,851),(246,880),
             (250,918),(230,934),(139,935),(135,914),(150,888),(172,864),(177,829),(180,784)],
}

def base_body(source):
    result = blank()
    d = ImageDraw.Draw(result)
    outline = [(274,214),(267,229),(235,245),(189,261),(164,291),(142,397),(156,452),
               (197,498),(240,530),(245,558),(217,587),(200,697),(183,817),(153,888),
               (150,919),(241,923),(252,906),(254,826),(275,721),(300,629),
               (340,629),(365,721),(386,826),(388,906),(399,923),(490,919),
               (487,888),(457,817),(440,697),(423,587),(395,558),(400,530),
               (443,498),(484,452),(498,397),(476,291),(451,261),(405,245),(373,229),(366,214)]
    d.polygon(outline, fill="#242532", outline=INK, width=7)
    d.polygon([(250,260),(320,282),(390,260),(411,404),(387,547),(253,547),(229,404)], fill="#303141")
    for y in range(297, 535, 19):
        d.line([(249,y),(320,y+12),(391,y)], fill="#1c1d28", width=3)
    d.rounded_rectangle((280,488,360,553), radius=17, fill="#302c2c", outline=INK, width=5)
    result.alpha_composite(cut(source, polygon(FACE)))
    return result

def build(name, source):
    shoulder_points = SHOULDER.get(name, DEFAULT_SHOULDER)
    shoulders = pairs(shoulder_points)
    chest = union(polygon(TORSO), pairs(ARM))
    # Keep rigid pieces independent and leave the shared face visible.
    face = polygon(FACE_OPENING)
    helm_outline = polygon([(130,0),(510,0),(510,164),(453,228),(408,249),(370,249),
                            (352,237),(288,237),(270,249),(231,248),(188,229),(130,160)])
    helm = ImageChops.subtract(helm_outline, union(face, shoulders))
    legs = pairs(LEG_OVERRIDES.get(name, LEG))
    boots = pairs(BOOT_OVERRIDES.get(name, BOOT))
    weapon = polygon(WEAPON.get(name, DEFAULT_WEAPON))
    # The handle is hidden by the fingers. Do not copy gloves from the weapon set.
    hand_gap = polygon([(233,501),(294,494),(310,507),(330,507),(348,495),(407,500),
                        (390,545),(348,566),(289,567),(247,549)])
    weapon = ImageChops.subtract(weapon, hand_gap)
    # The rear cloth under detached pieces has to be supplied independently.
    # No floor or contact shadow belongs in the cape image.
    cape = blank()
    d = ImageDraw.Draw(cape)
    outline = [(201,322),(437,321),(485,485),(517,664),(535,824),(500,860),
               (430,878),(320,874),(210,878),(140,860),(105,824),(123,664),(155,485)]
    d.polygon(outline, fill=CAPES[name], outline=INK, width=7)
    for points in ([(210,433),(163,821),(204,853),(240,464)],
                   [(433,431),(478,834),(447,858),(407,466)],
                   [(299,570),(282,863),(317,872),(329,591)]):
        d.polygon(points, fill=tuple(int(CAPES[name][i:i+2],16)*3//4 for i in (1,3,5)) + (255,))
    foreground = union(chest, shoulders, legs, boots, weapon, helm_outline,
        polygon([(45,180),(575,180),(582,293),(499,284),(480,409),(162,409),(142,284),(57,293)]),
        polygon([(135,527),(240,515),(398,515),(505,527),(485,634),(444,925),(197,925)]))
    rear_area = polygon([(11,265),(628,265),(639,858),(598,916),(511,916),
                         (480,871),(162,871),(125,916),(42,916),(4,858)])
    rear = ImageChops.subtract(rear_area, foreground)
    if name == "flag":
        # The standard is mounted behind the shield, including its upper finial.
        standard = polygon([(408,0),(639,0),(639,300),(618,319),(550,291),
                            (505,271),(461,254),(413,247),(399,234),(406,185)])
        rear = union(rear, standard)
        helm = ImageChops.subtract(helm, standard)
    cape.alpha_composite(cut(source, rear))

    # Preserve underlying torso pixels at shoulder edges. Clear the old hilt and
    # pommel using in-set leather immediately next to it before layering weapons.
    torso = cut(source, ImageChops.subtract(chest, union(face, weapon, shoulders)))
    d = ImageDraw.Draw(torso)
    d.rounded_rectangle((309,454,331,503),radius=6,fill="#332823")
    torso = Image.alpha_composite(torso, cut(source, ImageChops.multiply(chest, hand_gap)))
    # Register soles to one baseline without moving the greave/knee overlap.
    boot_layer = cut(source, ImageChops.subtract(boots, weapon))
    registered_boots = blank()
    for side in (0, 320):
        piece = boot_layer.crop((side, 747, side + 320, 960))
        bounds = piece.getchannel("A").point(lambda p: 255 if p > 112 else 0).getbbox()
        if bounds:
            sole = bounds[3]
            piece = piece.crop((0, 0, 320, min(213, sole + 2)))
            registered_boots.alpha_composite(piece.resize((320, 192), Image.Resampling.LANCZOS), (side, 747))
    return {
        "cape": cape,
        "chest": torso,
        "legs": cut(source, ImageChops.subtract(legs, weapon)),
        "boots": registered_boots,
        "shoulders": cut(source, ImageChops.subtract(shoulders, face)),
        "helm": cut(source, helm),
        "weapon": cut(source, weapon),
    }

def export(image, path):
    image.resize(OUTPUT, Image.Resampling.LANCZOS).save(path, optimize=True)

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("sets", nargs="*", choices=SETS)
    args = parser.parse_args()
    LAYERS.mkdir(exist_ok=True)
    export(base_body(art("bronze")), LAYERS / "base_body.png")
    for name in args.sets or SETS:
        for slot,image in build(name,art(name)).items():
            export(image,LAYERS / f"{name}_{slot}.png")

if __name__ == "__main__":
    main()
