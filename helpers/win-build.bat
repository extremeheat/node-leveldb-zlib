tar -xf win-vcpkg-export.tar.gz
set CMAKE_TOOLCHAIN_FILE=%CD%\vcpkg-export\scripts\buildsystems\vcpkg.cmake
echo '::set-output name=CMAKE_TOOLCHAIN_FILE::%CMAKE_TOOLCHAIN_FILE%'

::TODO: we should expand this to macOS also