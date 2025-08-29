import { getAllSchedules } from './read';
import { getClientAndContract } from './utils';
import { bytesToStr } from '@massalabs/massa-web3';

const { provider, contract } = await getClientAndContract();

const schedules = await getAllSchedules(provider, contract.address);

// Beautiful logging of retrieved schedules
console.log('\n🚀 SCHEDULE RETRIEVAL REPORT');
console.log('='.repeat(50));

if (schedules.length === 0) {
  console.log('\n❌ No schedules found or error occurred');
  console.log('💡 Check if the contract is deployed and has schedules');
} else {
  console.log('\n📋 SCHEDULE DETAILS:');
  console.log('─'.repeat(50));

  schedules.forEach((schedule, index) => {
    console.log(`\n🔹 Schedule #${index + 1} (ID: ${schedule.id})`);
    console.log('   ├─ 📤 Spender:', schedule.spender);
    console.log('   ├─ 📥 Recipient:', schedule.recipient);
    console.log('   ├─ 🪙 Token:', schedule.tokenAddress || 'MAS (Native)');
    console.log('   ├─ 💰 Amount:', schedule.amount.toString());
    console.log('   ├─ ⏱️  Interval:', schedule.interval.toString(), 'periods');
    console.log('   ├─ 🔢 Total Occurrences:', schedule.occurrences.toString());
    console.log('   ├─ ✅ Remaining:', schedule.remaining.toString());
    console.log('   ├─ 🎯 Tolerance:', schedule.tolerance.toString());
    console.log('   ├─ 🔒 Vesting:', schedule.isVesting ? 'Yes' : 'No');
    console.log('   ├─ 🆔 Operation ID:', schedule.operationId || 'N/A');
    console.log('   └─ 📜 History Entries:', schedule.history.length);

    // Show transfer history if available
    if (schedule.history.length > 0) {
      console.log('      📚 Transfer History:');
      schedule.history.forEach((transfer, histIndex) => {
        console.log(
          `         ${histIndex + 1}. Period: ${transfer.period}, Thread: ${
            transfer.thread
          }, Task: ${transfer.taskIndex}`,
        );
      });
    }

    // Status indicator
    const status = schedule.remaining > 0n ? '🟢 ACTIVE' : '🔴 COMPLETED';
    const progress =
      schedule.occurrences > 0n
        ? Math.round(
            ((Number(schedule.occurrences) - Number(schedule.remaining)) /
              Number(schedule.occurrences)) *
              100,
          )
        : 0;

    console.log(`      📈 Status: ${status} (${progress}% complete)`);
    console.log('─'.repeat(50));
  });

  // Summary statistics
  console.log('\n📊 SUMMARY STATISTICS:');
  console.log('─'.repeat(30));

  console.log(`📋 Contract Address: ${contract.address}`);
  console.log(`💰 Contract MAS balance: ${await contract.balance()}`);
  console.log(
    `📤 Contract owner: ${bytesToStr(
      (await contract.read('ownerAddress')).value,
    )}`,
  );
  console.log(`📊 Total Schedules Found: ${schedules.length}`);
  console.log('='.repeat(50));

  const activeSchedules = schedules.filter((s) => s.remaining > 0n);
  const completedSchedules = schedules.filter((s) => s.remaining === 0n);
  const vestingSchedules = schedules.filter((s) => s.isVesting);
  const regularSchedules = schedules.filter((s) => !s.isVesting);

  console.log(`🟢 Active Schedules: ${activeSchedules.length}`);
  console.log(`🔴 Completed Schedules: ${completedSchedules.length}`);
  console.log(`🔒 MAS Vesting Schedules: ${vestingSchedules.length}`);
  console.log(`📅 Regular Schedules: ${regularSchedules.length}`);

  if (activeSchedules.length > 0) {
    const totalRemaining = activeSchedules.reduce(
      (sum, s) => sum + Number(s.remaining),
      0,
    );
    const avgRemaining = totalRemaining / activeSchedules.length;
    console.log(`\n📈 Average remaining transfers: ${avgRemaining.toFixed(1)}`);
  }

  console.log('\n✨ Schedule retrieval completed successfully!');
}
