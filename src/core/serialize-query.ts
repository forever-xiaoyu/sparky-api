/** 稳定序列化查询参数，用于 URL 参数和重复请求键。 */
export function serializeQuery(value: unknown) {
  const pairs: Array<[string, string]> = []
  append(value, '', pairs)
  return pairs.map(([key, item]) => `${encodeURIComponent(key)}=${encodeURIComponent(item)}`).join('&')
}

function append(value: unknown, key: string, pairs: Array<[string, string]>): void {
  if (value === undefined) return
  if (value === null) {
    pairs.push([key, ''])
    return
  }
  if (Array.isArray(value)) {
    value.forEach((item) => append(item, `${key}[]`, pairs))
    return
  }
  if (typeof value === 'object') {
    Object.keys(value as Record<string, unknown>)
      .sort()
      .forEach((name) => {
        const childKey = key ? `${key}[${name}]` : name
        append((value as Record<string, unknown>)[name], childKey, pairs)
      })
    return
  }
  pairs.push([key, String(value)])
}
