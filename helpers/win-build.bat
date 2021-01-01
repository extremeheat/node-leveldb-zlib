tar -xf win-vcpkg-export.tar.gz
set CMAKE_TOOLCHAIN_FILE=%CD%\vcpkg-export\scripts\buildsystems\vcpkg.cmake
echo '::set-output name=CMAKE_TOOLCHAIN_FILE::%CMAKE_TOOLCHAIN_FILE%'
setx CMAKE_TOOLCHAIN_FILE %CMAKE_TOOLCHAIN_FILE%
node win-build.js "set( CMAKE_TOOLCHAIN_FILE %CMAKE_TOOLCHAIN_FILE% )"
::echo set(CMAKE_TOOLCHAIN_FILE %CMAKE_TOOLCHAIN_FILE%) > CMakeExtras.txt
::TODO: we should expand this to macOS also