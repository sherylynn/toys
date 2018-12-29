class Student {
  fullName:string;
  constructor(public firstName:string,
    public middleInitial:string,public lastName:string){
      this.fullName=firstName+" "+middleInitial+" "+lastName;
  }
}
interface Person{
  firstName:string;
  lastName:string;
}
function greeter(person:Person){
  return "Hello, " + person.firstName+person.lastName;
}
let user:Person=new Student("shery","L.","lynn");
console.log(user.firstName)

console.log(greeter(user));
class Animal {
  move(distanceInMeters:number=0):void{
    console.log(`Animal moved $(distanceInMeters)m.`);
  }
}
class Cat extends Animal{
  bark():void{
    console.log('Moew! Moew!');
  }
}
const ugly:Cat=new Cat();
ugly.bark()

class Greeter{
  static standardGreeting="Hello, there";
  greeting:string;
  greet():string{
    if(this.greeting){
      return "Hellow, "+ this.greeting;
    }else{
      return Greeter.standardGreeting;
    }
  };
  show():void{
    console.log(this.greet());
  }
}
let greeter1:Greeter;
greeter1=new Greeter();
greeter1.show();
let greeterMaker:typeof Greeter =Greeter;
Greeter.standardGreeting="hello"
console.log(Greeter.standardGreeting);
let myAdd=(x,y)=>{return x+y }