#include "json/single_include/nlohmann/json.hpp"
#include <fstream>
#include <iostream>
#include <sstream>
#include <string>

nlohmann::json get_resolution_json(std::string path){
  using json = nlohmann::json;
  std::ifstream input(path);
  json j;
  input >> j;
  return j;
}

nlohmann::json get_default_resolution(nlohmann::json resolution_json,std::string default_label="default"){
  //get default resolution size by read default_label
  std::string default_resolution_size;
  default_resolution_size=resolution_json[default_label];
  //get detail default resolution json by default resolution size
  nlohmann::json default_resolution_json;
  default_resolution_json=resolution_json[default_resolution_size];
  return default_resolution_json;
}
int get_resolution_width(nlohmann::json default_resolution_json){
  int width;
  width=default_resolution_json["w"];
  return width;
}
int get_resolution_high(nlohmann::json default_resolution_json){
  int high;
  high=default_resolution_json["h"];
  return high;
}
int main() {
  std::string path;
  path="resolution.json";
  nlohmann::json resolution_json;
  resolution_json=get_resolution_json(path);
  nlohmann::json default_resolution_json;
  default_resolution_json=get_default_resolution(resolution_json);
  int high;
  high=get_resolution_high(default_resolution_json);
  std::cout << high << std::endl;
  return 0;
}
