cmake_minimum_required(VERSION 3.10)

if (WIN32)
    if(NOT DEFINED CMAKE_TOOLCHAIN_FILE AND DEFINED ENV{CMAKE_TOOLCHAIN_FILE})
        set(CMAKE_TOOLCHAIN_FILE $ENV{CMAKE_TOOLCHAIN_FILE})
    endif()
    message("Using CMAKE_TOOLCHAIN_FILE ${ENV} ${CMAKE_TOOLCHAIN_FILE}")

    # Uncomment this to dump env vars:
    #get_cmake_property(_variableNames VARIABLES)
    #list (SORT _variableNames)
    #foreach (_variableName ${_variableNames})
    #    message(STATUS "${_variableName}=${${_variableName}}")
    #endforeach()
endif()

set(CMAKE_POSITION_INDEPENDENT_CODE ON)
project( node-leveldb )
add_subdirectory( leveldb-mcpe )

if (UNIX)
    add_definitions(-DLEVELDB_PLATFORM_POSIX "-DDLLX=")
    if(APPLE)
        add_definitions(-DOS_MACOSX)
    endif()
elseif (WIN32)
    add_definitions(-DLEVELDB_PLATFORM_WINDOWS "-DDLLX=__declspec(dllexport)")
endif()

include_directories("leveldb-mcpe/include"})

include_directories(${CMAKE_JS_INC})
file(GLOB SOURCE_FILES "src/*.cpp" "src/*.h")
add_library(${PROJECT_NAME} SHARED ${SOURCE_FILES} ${CMAKE_JS_SRC})
set_target_properties(${PROJECT_NAME} PROPERTIES PREFIX "" SUFFIX ".node")
target_link_libraries(${PROJECT_NAME} ${CMAKE_JS_LIB})

# Include N-API wrappers
include_directories(
    ${CMAKE_SOURCE_DIR}/node_modules/node-addon-api 
    ${CMAKE_SOURCE_DIR}/node_modules/node-addon-api/src
    ${CMAKE_JS_INC}
)

message(STATUS "Include dirs")
get_property(dirs DIRECTORY ${CMAKE_CURRENT_SOURCE_DIR} PROPERTY INCLUDE_DIRECTORIES)
foreach(dir ${dirs})
  message(STATUS "dir='${dir}'")
endforeach()


# define NPI_VERSION
add_definitions(-DNAPI_VERSION=3)

target_link_libraries( node-leveldb leveldb )
