#!/bin/bash

# 将目录名转换为小写
function lowercase_dirname() {
  local DIRNAME="$1"
  local LOWERCASE_DIRNAME="$(echo "$DIRNAME" | tr '[:upper:]' '[:lower:]')"
  if [ "$DIRNAME" != "$LOWERCASE_DIRNAME" ]; then
    mv "$DIRNAME" "$LOWERCASE_DIRNAME"
  fi
}

# 将文件名转换为小写
function lowercase_filename() {
  local FILENAME="$1"
  local LOWERCASE_FILENAME="$(echo "$FILENAME" | tr '[:upper:]' '[:lower:]')"
  if [ "$FILENAME" != "$LOWERCASE_FILENAME" ]; then
    mv "$FILENAME" "$LOWERCASE_FILENAME"
  fi
}

# 遍历目录并转换文件名和目录名
function traverse_directory() {
  local DIR="$1"
  cd "$DIR"
  for FILE in *; do
    if [ -d "$FILE" ]; then
      lowercase_dirname "$FILE"
      traverse_directory "$FILE"
    else
      lowercase_filename "$FILE"
    fi
  done
  cd ..
}

# 转换目标目录
traverse_directory "/Users/jasperl./Documents/GitHub/Kaguya"