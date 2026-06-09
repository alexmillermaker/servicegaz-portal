import re

path = "src/pages/user/NavigatePage.vue"
content = open(path, encoding="utf-8").read()

# Replace: stroke-width="3" style="cursor:pointer;transition:fill 0.15s,stroke 0.15s"
# With:    :stroke-width="roomStrokeWidth(id)" :stroke-opacity="roomStrokeOpacity(id)" style="cursor:pointer;transition:fill 0.15s,stroke 0.15s"
old = 'stroke-width="3" style="cursor:pointer;transition:fill 0.15s,stroke 0.15s"'
new = ':stroke-width="roomStrokeWidth(_id)" :stroke-opacity="roomStrokeOpacity(_id)" style="cursor:pointer;transition:fill 0.15s,stroke 0.15s"'

# Actually, replace each occurrence capturing the roomStroke id
def repl(m):
    room_id = m.group(1)
    return (
        f':stroke-width="roomStrokeWidth({room_id})" '
        f':stroke-opacity="roomStrokeOpacity({room_id})" '
        'style="cursor:pointer;transition:fill 0.15s,stroke 0.15s"'
    )

pattern = r'stroke-width="3" style="cursor:pointer;transition:fill 0\.15s,stroke 0\.15s" @click="selectPoint\(([^)]+)\)"'
# We need to keep @click, so include it in match but not replace it
def repl2(m):
    room_id = m.group(1)
    return (
        f':stroke-width="roomStrokeWidth({room_id})" '
        f':stroke-opacity="roomStrokeOpacity({room_id})" '
        f'style="cursor:pointer;transition:fill 0.15s,stroke 0.15s" @click="selectPoint({room_id})"'
    )

new_content = re.sub(pattern, repl2, content)
changed = content.count('stroke-width="3"')
print(f"Replacing {changed} occurrences of stroke-width=3")
open(path, "w", encoding="utf-8").write(new_content)
remaining = new_content.count('stroke-width="3"')
print(f"Remaining: {remaining}")
