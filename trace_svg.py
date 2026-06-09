import re

SVG = open("public/maps/b1_floor1.svg", encoding="utf-8").read()
path_d = re.search(r'<path[^>]+d="([^"]+)"', SVG).group(1)

def trace_full(d):
    """Trace full compound SVG path, return list of (x,y) vertices."""
    verts = []
    x = y = sx = sy = 0.0
    # tokenize
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
print(f"Total vertices: {len(all_verts)}")

def xs_near(target_y, tol=4):
    pts = [(x,y) for x,y in all_verts if abs(y-target_y)<tol]
    return sorted(set(round(x,1) for x,y in pts))

print("\n=== X values at y≈228 (upper row top) ===")
print(xs_near(228))
print("\n=== X values at y≈387 (upper row bottom) ===")
print(xs_near(387))
print("\n=== X values at y≈427 (corridor mid) ===")
print(xs_near(427, tol=10))
print("\n=== X values at y≈467 (lower row top) ===")
print(xs_near(467))
print("\n=== X values at y≈598 (lower row ~mid) ===")
print(xs_near(598, tol=5))
print("\n=== X values at y≈656 (lower row bottom) ===")
print(xs_near(656, tol=10))

# Find door positions: narrow x-ranges at y≈387 (upper) and y≈467 (lower)
# A "door" opening is a gap in the wall — look for adjacent pairs where gap > 10px
print("\n=== ALL vertices in corridor zone y=387..467 ===")
corridor_verts = [(round(x,1), round(y,1)) for x,y in all_verts if 385 < y < 469]
corridor_verts.sort(key=lambda p: (p[1], p[0]))
# show unique x values per y band
from collections import defaultdict
by_y = defaultdict(set)
for x,y in corridor_verts:
    by_y[round(y,0)].add(x)
for yr in sorted(by_y):
    xs = sorted(by_y[yr])
    if len(xs) > 1:
        print(f"  y={yr}: {xs}")
