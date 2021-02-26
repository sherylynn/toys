#include "json/single_include/nlohmann/json.hpp"
#include <fstream>
#include <iostream>
#include <sstream>
#include <string>
int get_resolution_width(){
  
}
int main() {
  using json = nlohmann::json;
  std::ifstream input("resolution.json");
  json j;
  input >> j;
  std::string default_resolution;
  default_resolution = j["default"];
  int high;
  int width;
  high=j[default_resolution]["h"];
  width=j[default_resolution]["w"];
  std::cout << high << std::endl;
  return 0;
}