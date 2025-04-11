<?php

namespace Database\Seeders;

use App\Models\Branch;
use Illuminate\Database\Seeder;
use Faker\Factory as Faker;
use Illuminate\Support\Facades\DB;

class BranchSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {

        $descriptions = [
            'MATRIZ',
            'LINDOIA DO SUL',
            'IPUMIRIM',
            'SEARA',
            'XAVANTINA',
            'PERITIBA',
            'PIRATUBA',
            'ITA',
            'SILO CONCORDIA',
            'CENTRAL DE COMPRAS',
            'SILO SEARA',
            'PAIAL',
            'ARABUTA',
            'POSTO LEITE SANTO ANTONIO',
            'ARVOREDO',
            'PONTE SERRADA',
            'ALTO BELA VISTA',
            'SUPER CONCORDIA',
            'PRESIDENTE CASTELLO BRANCO',
            'EMBRAPA',
            'FABRICA RACOES SANTO ANTONIO',
            'LOJA SANTO ANTONIO AGRO',
            'PASSOS MAIA',
            'IPIRA',
            'CAPINZAL UBS',
            'SILO PASSOS MAIA',
            'ARATIBA',
            'LOJA SEVERIANO DE ALMEIDA',
            'GAURAMA',
            'TRES ARROIOS',
            'INDUSTRIA DE MADEIRA',
            'POSTO COMBUSTIVEIS ST ANTONIO',
            'IRANI',
            'MAJOR VIEIRA',
            'CANOINHAS',
            'LOJA AGROPECUARIA AGUA DOCE',
            'BELA VISTA DO TOLDO',
            'VARGEM BONITA',
            'LOJA AGROPECUARIA JOACABA',
            'TREZE TILIAS',
            'SILO IRINEOPOLIS',
            'HERVAL DO OESTE',
            'LOJA AGROPECUARIA VARGEAO',
            'FAXINAL DOS GUEDES',
            'LOJA AGROPECUARIA LUZERNA',
            'LOJA ERVAL VELHO',
            'IBICARE',
            'CATANDUVAS',
        ];

        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        DB::table('branches')->truncate(); // clears the table first
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        $usedCodes = [];

        foreach ($descriptions as $description) {
            do {
                $code = rand(1000, 9999);
            } while (in_array($code, $usedCodes));

            $usedCodes[] = $code;

            Branch::create([
                'code' => 100 + $code,
                'description' => $description
            ]);
        }
    }
}
