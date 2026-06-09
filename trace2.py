import re
from collections import defaultdict

SVG = open("public/maps/b1_floor1.svg", encoding="utf-8").read()
path_d = re.search(r'<path[^>]+d="([^"]+)"', SVG).group(1)

def trace_full(d):
    verts = []
    x = y = sx = sy = 0.0
    tokens = re.findall(r'[MmHhVvLlZzSsCcQq]|[-+]?[0-9]*\.?[0-9]+(?:\.[0-9]+)?', d)
    i = 0
    cmd = 'M'
    while i < len(tokens):
        t = tokens[i]
        if t in 'MmHhVvLlZzSsCcQq':
            cmd = t; i += 1; continue
        try:
            if cmd == 'M':
                x, y = float(tokens[i]), float(tokens[i+1]); sx, sy = x, y; i+=2; verts.append((x,y)); cmd='L'
            elif cmd == 'm':
                x+=float(tokens[i]); y+=float(tokens[i+1]); sx,sy=x,y; i+=2; verts.append((x,y)); cmd='l'
            elif cmd == 'H': x = float(tokens[i]); i+=1; verts.append((x,y))
            elif cmd == 'h': x += float(tokens[i]); i+=1; verts.append((x,y))
            elif cmd == 'V': y = float(tokens[i]); i+=1; verts.append((x,y))
            elif cmd == 'v': y += float(tokens[i]); i+=1; verts.append((x,y))
            elif cmd == 'L': x,y = float(tokens[i]),float(tokens[i+1]); i+=2; verts.append((x,y))
            elif cmd == 'l': x+=float(tokens[i]); y+=float(tokens[i+1]); i+=2; verts.append((x,y))
            elif cmd in ('Z','z'): x,y = sx,sy; verts.append((x,y))
            elif cmd == 'S': x,y = float(tokens[i+2]),float(tokens[i+3]); i+=4; verts.append((x,y))
            elif cmd == 's': x+=float(tokens[i+2]); y+=float(tokens[i+3]); i+=4; verts.append((x,y))
            elif cmd == 'C': x,y = float(tokens[i+4]),float(tokens[i+5]); i+=6; verts.append((x,y))
            elif cmd == 'c': x+=float(tokens[i+4]); y+=float(tokens[i+5]); i+=6; verts.append((x,y))
            elif cmd == 'Q': x,y = float(tokens[i+2]),float(tokens[i+3]); i+=4; verts.append((x,y))
            elif cmd == 'q': x+=float(tokens[i+2]); y+=float(tokens[i+3]); i+=4; verts.append((x,y))
            else: i+=1
        except (IndexError, ValueError):
            i+=1
    return verts

all_verts = trace_full(path_d)

def xs_near(target_y, tol=3):
    return sorted(set(round(x,1) for x,y in all_verts if abs(y-target_y)<tol))

# Scan lower row (y=467..660) at every 20px to find consistent x walls
print("=== Lower row scan (vertical walls) ===")
for ty in range(480, 660, 15):
    xs = xs_near(ty, tol=5)
    if xs:
        print(f"  y={ty}: {xs}")

print()
print("=== Full right wing y=285..420 ===")
for ty in range(285, 425, 10):
    xs = xs_near(ty, tol=5)
    if xs:
        print(f"  y={ty}: {xs}")

print()
print("=== Upper wall y=387 doors detail ===")
xs = xs_near(387, tol=2)
print(f"  y=387: {xs}")
# Identify door pairs (gaps < 20px between consecutive x values)
pairs = []
for i in range(len(xs)-1):
    gap = xs[i+1] - xs[i]
    if 8 < gap < 25:
        pairs.append((xs[i], xs[i+1], round((xs[i]+xs[i+1])/2, 1)))
print(f"  Door frames at y=387: {pairs}")

print()
print("=== Lower wall y=435-442 doors detail ===")
for ty in [435, 436, 440, 442, 445]:
    xs = xs_near(ty, tol=3)
    if xs:
        pairs = []
        for i in range(len(xs)-1):
            gap = xs[i+1] - xs[i]
            if 8 < gap < 25:
                pairs.append((xs[i], xs[i+1], round((xs[i]+xs[i+1])/2, 1)))
        print(f"  y={ty}: doors={pairs}  all={xs}")

print()
print("=== Bottom of building y=650..680 ===")
for ty in range(650, 685, 5):
    xs = xs_near(ty, tol=3)
    if xs:
        print(f"  y={ty}: {xs}")

print()
print("=== Right wing corridor area y=285..387 x>750 ===")
for ty in range(285, 390, 5):
    xs = [x for x in xs_near(ty, tol=3) if x > 750]
    if xs:
        print(f"  y={ty}: {xs}")
