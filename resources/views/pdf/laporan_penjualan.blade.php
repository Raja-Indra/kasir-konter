<!DOCTYPE html>
<html>
<head>
    <title>Laporan Penjualan</title>
    <style>
        body { font-family: sans-serif; font-size: 12px; }
        .header { text-align: center; margin-bottom: 20px; }
        .header h1 { margin: 0; font-size: 18px; }
        .header p { margin: 2px 0; }

        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; font-weight: bold; }

        .text-right { text-align: right; }
        .text-center { text-align: center; }
        .bg-gray { background-color: #f9f9f9; }

        .summary { margin-top: 20px; float: right; width: 40%; }
        .summary table { border: none; }
        .summary td { border: none; padding: 4px; }
        .summary .total { font-weight: bold; font-size: 14px; }
    </style>
</head>
<body>

    <div class="header">
        <h1>INDRA CELL</h1>
        <p>Laporan Penjualan</p>
        <p>Periode: {{ \Carbon\Carbon::parse($startDate)->format('d M Y') }} - {{ \Carbon\Carbon::parse($endDate)->format('d M Y') }}</p>
    </div>

    <table>
        <thead>
            <tr>
                <th style="width: 5%">No</th>
                <th style="width: 20%">Tanggal</th>
                <th style="width: 20%">No Nota</th>
                <th style="width: 15%">Kasir</th>
                <th class="text-right">Total Belanja</th>
                <th class="text-right">Laba</th>
            </tr>
        </thead>
        <tbody>
            @forelse($transaksi as $index => $item)
            <tr>
                <td class="text-center">{{ $index + 1 }}</td>
                <td>{{ $item->created_at->format('d/m/Y H:i') }}</td>
                <td>
                    {{ $item->no_nota }}
                    @if($item->hutang)
                        <br><small style="color: #d97706;">(Hutang)</small>
                    @endif
                </td>
                <td>{{ $item->user->name ?? '-' }}</td>
                <td class="text-right">Rp {{ number_format($item->total_harga, 0, ',', '.') }}</td>
                <td class="text-right">Rp {{ number_format($item->total_laba, 0, ',', '.') }}</td>
            </tr>
            @empty
            <tr>
                <td colspan="6" class="text-center">Tidak ada data transaksi pada periode ini.</td>
            </tr>
            @endforelse
        </tbody>
        <tfoot>
            <tr class="bg-gray">
                <td colspan="5" class="font-bold text-right" style="font-weight: bold;">TOTAL OMZET</td>
                <td class="font-bold text-right" style="font-weight: bold;" colspan="2">Rp {{ number_format($totalOmzet, 0, ',', '.') }}</td>
            </tr>
            <tr class="bg-gray">
                <td colspan="5" class="font-bold text-right" style="font-weight: bold;">TOTAL LABA BERSIH</td>
                <td class="font-bold text-right" style="font-weight: bold;" colspan="2">Rp {{ number_format($totalLabaBersih, 0, ',', '.') }}</td>
            </tr>
            <tr class="bg-gray">
                <td colspan="5" class="font-bold text-right" style="font-weight: bold;">TOTAL LABA HUTANG</td>
                <td class="font-bold text-right" style="font-weight: bold; color: #d97706;" colspan="2">Rp {{ number_format($totalLabaHutang, 0, ',', '.') }}</td>
            </tr>
            <tr class="bg-gray">
                <td colspan="5" class="font-bold text-right" style="font-weight: bold;">TOTAL KESELURUHAN LABA</td>
                <td class="font-bold text-right" style="font-weight: bold;" colspan="2">Rp {{ number_format($totalLabaBersih + $totalLabaHutang, 0, ',', '.') }}</td>
            </tr>
        </tfoot>
    </table>

</body>
</html>
tr>
        </tfoot>
    </table>

</body>
</html>
