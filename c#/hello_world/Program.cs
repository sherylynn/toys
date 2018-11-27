using System;

namespace hello_world
{
    class Program
    {
        static void Main(string[] args)
        {
            var account = new BankAccount("lynn",1000);
            Console.WriteLine($"account {account.Number} Owner is {account.Owner} ");
            var account2 = new BankAccount("lynn", 1000);
            Console.WriteLine($"account {account2.Number} Owner is {account2.Owner} ");
            account.MakeWithdrawal(500, DateTime.Now, "Rent payment");
            Console.WriteLine(account.Balance);
            account.MakeDeposit(1000, DateTime.Now, "friend paid me back");
            Console.WriteLine(account.Balance);

            try
            {
                var invalidAccount = new BankAccount("invalid", -55);
            }
            catch(ArgumentNullException e)
            {
                Console.WriteLine("Exception caught creating account winth negative balance");
                Console.WriteLine(e.ToString());
            }
            try
            {
                account.MakeWithdrawal(10000, DateTime.Now, "attempt to overdraw");
            }
            catch(InvalidOperationException e)
            {
                Console.WriteLine("exception caught trying to overdraw");
                Console.WriteLine(e.ToString());
            }
            Console.WriteLine(account.GetAccountHistory());
        }
    }
}
