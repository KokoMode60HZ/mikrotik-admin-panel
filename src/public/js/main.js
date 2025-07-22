document.addEventListener('DOMContentLoaded', function() {
  const sidebar = document.querySelector('.sidebar');
  const toggleBtn = document.getElementById('sidebar-toggle');
  if (sidebar && toggleBtn) {
    toggleBtn.addEventListener('click', function() {
      sidebar.classList.toggle('collapsed');
    });
  }
});