#include "json/single_include/nlohmann/json.hpp"
#include <fstream>
#include <iostream>
#include <sstream>
#include <string>
int get_resolution_width(std::string path){
  using json = nlohmann::json;
  std::ifstream input(path);
  json j;
  input >> j;
  std::string default_resolution;
  default_resolution = j["default"];
  int high;
  int width;
  width=j[default_resolution]["w"];
  return width;
}
int get_resolution_high(std::string path){
  using json = nlohmann::json;
  std::ifstream input(path);
  json j;
  input >> j;
  std::string default_resolution;
  default_resolution = j["default"];
  int high;
  int width;
  high=j[default_resolution]["h"];
  return high;
}
int main() {
  std::string path;
  path="resolution.json";
  int high;
  high=get_resolution_high(path);
  std::cout << high << std::endl;
  return 0;
}