import re

path = 'd:/Koderz_T/Admin_TSm_all/Transport_management/frontend/src/App.jsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

replacement = """const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('admin_username') !== null;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const RoleRoute = ({ children, allowedRoles }) => {
  const userRole = localStorage.getItem('user_role') || 'Admin';
  if (userRole === 'Admin') return children;
  if (allowedRoles && !allowedRoles.includes(userRole)) return <Navigate to="/" replace />;
  return children;
};"""

content = re.sub(r'const ProtectedRoute =.*?\};', replacement, content, flags=re.DOTALL)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

