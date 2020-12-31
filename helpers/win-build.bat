tar -xz vcpkg-export
setx CMAKE_TOOLCHAIN_FILE %CD%\vcpkg-export\scripts\buildsystems\vcpkg.cmake

::TODO: we should expand this to macOS also