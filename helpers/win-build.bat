tar -xf win-vcpkg-export.tar.gz
setx CMAKE_TOOLCHAIN_FILE %CD%\vcpkg-export\scripts\buildsystems\vcpkg.cmake

::TODO: we should expand this to macOS also