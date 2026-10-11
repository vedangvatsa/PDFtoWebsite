// Shared by the static-asset generator and runtime. No cryptographic purpose.
export function companyDescriptionShard(key) {
  let hash = 2166136261;
  for (let i = 0; i < key.length; i++) hash = Math.imul(hash ^ key.charCodeAt(i), 16777619);
  return (hash & 255).toString(16).padStart(2, '0');
}
