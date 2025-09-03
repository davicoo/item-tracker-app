function collectRoles(source, roles) {
  if (!source) return;
  if (Array.isArray(source)) {
    roles.push(...source);
  } else {
    roles.push(source);
  }
}

exports.getRoles = function getRoles(user) {
  const roles = [];
  collectRoles(user?.user_metadata?.roles, roles);
  collectRoles(user?.app_metadata?.roles, roles);
  collectRoles(user?.user_metadata?.role, roles);
  collectRoles(user?.app_metadata?.role, roles);
  return roles.map((r) => String(r).toLowerCase());
};
