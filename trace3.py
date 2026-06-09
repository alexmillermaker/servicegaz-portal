import re

SVG = open("public/maps/b1_floor1.svg", encoding="utf-8").read()
path_d = re.search(r'<path[^>]+d="([^"]+)"', SVG).group(1)

def trace_full(d):
    verts = []
    x = y = sx = sy = 0.0
    tokens = re.findall(r'[MmHhVvLlZzSsCcQq]|[-+]?[0-9]*\.?[0-9]+(?:\.[0-9]+)?', d)
    i = 0; cmd = 'M'
    while i < len(tokens):
        t = tokens[i]
        if t in 'MmHhVvLlZzSsCcQq':
            cmd = t; i += 1; continue
        try:
            if cmd == 'M':    x,y=float(tokens[i]),float(tokens[i+1]); sx,sy=x,y; i+=2; verts.append((x,y)); cmd='L'
            elif cmd == 'm':  x+=float(tokens[i]); y+=float(tokens[i+1]); sx,sy=x,y; i+=2; verts.append((x,y)); cmd='l'
            elif cmd == 'H':  x=float(tokens[i]); i+=1; verts.append((x,y))
            elif cmd == 'h':  x+=float(tokens[i]); i+=1; verts.append((x,y))
            elif cmd == 'V':  y=float(tokens[i]); i+=1; verts.append((x,y))
            elif cmd == 'v':  y+=float(tokens[i]); i+=1; verts.append((x,y))
            elif cmd == 'L':  x,y=float(tokens[i]),float(tokens[i+1]); i+=2; verts.append((x,y))
            elif cmd == 'l':  x+=float(tokens[i]); y+=float(tokens[i+1]); i+=2; verts.append((x,y))
            elif cmd in ('Z','z'): x,y=sx,sy; verts.append((x,y))
            elif cmd == 'S':  x,y=float(tokens[i+2]),float(tokens[i+3]); i+=4; verts.append((x,y))
            elif cmd == 's':  x+=float(tokens[i+2]); y+=float(tokens[i+3]); i+=4; verts.append((x,y))
            elif cmd == 'C':  x,y=float(tokens[i+4]),float(tokens[i+5]); i+=6; verts.append((x,y))
            elif cmd == 'c':  x+=float(tokens[i+4]); y+=float(tokens[i+5]); i+=6; verts.append((x,y))
            else: i+=1
        except: i+=1
    return verts

all_verts = trace_full(path_d)

def xs_near(ty, tol=4, xmin=0, xmax=9999):
    return sorted(set(round(x,0) for x,y in all_verts if abs(y-ty)<tol and xmin<=x<=xmax))

# Right section: security + HR door analysis
print("=== Right section x>900, scanning every 10px ===")
for ty in range(435, 660, 10):
    xs = xs_near(ty, tol=5, xmin=900)
    if xs:
        print(f"  y={ty}: {xs}")

print()
print("=== OTIZ area x<350, scanning every 10px y=430..660 ===")
for ty in range(430, 660, 10):
    xs = xs_near(ty, tol=5, xmin=90, xmax=350)
    if xs:
        print(f"  y={ty}: {xs}")

print()
print("=== Meeting/right wing area, y=228..467, x=758..1092 ===")
for ty in range(228, 470, 8):
    xs = xs_near(ty, tol=4, xmin=758, xmax=1095)
    if xs:
        print(f"  y={ty}: {xs}")
