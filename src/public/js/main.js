document.addEventListener('DOMContentLoaded', function() {
  const sidebar = document.querySelector('.sidebar');
  const toggleBtn = document.getElementById('sidebar-toggle');
  if (sidebar && toggleBtn) {
    toggleBtn.addEventListener('click', function() {
      sidebar.classList.toggle('collapsed');
    });
  }

  // Dropdown/accordion submenu
  document.querySelectorAll('.submenu-toggle').forEach(function(btn) {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      const parent = btn.closest('.has-submenu');
      const isOpen = parent.classList.contains('open');
      
      // Tutup semua submenu lain
      document.querySelectorAll('.has-submenu').forEach(function(item) {
        if (item !== parent) {
          item.classList.remove('open');
        }
      });
      
      // Toggle submenu yang diklik
      parent.classList.toggle('open');
    });
  });
});