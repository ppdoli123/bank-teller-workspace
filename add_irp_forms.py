#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import psycopg2
import json
from psycopg2.extras import RealDictCursor

# Supabase 연결 정보
DB_CONFIG = {
    'host': 'aws-1-ap-northeast-2.pooler.supabase.com',
    'port': 6543,
    'database': 'postgres',
    'user': 'postgres.jhfjigeuxrxxbbsoflcd',
    'password': 'rlaehdgml1!'
}

def add_irp_forms():
    """P033_아이_꿈하나_적금 상품에 대한 서식 5개를 추가합니다."""
    
    # 서식 데이터 정의
    forms_data = [
        {
            'formid': 'FORM-IRP-001',
            'formname': '아이 꿈하나 적금 가입신청서',
            'formtype': 'deposit',
            'productid': 'P033_아이_꿈하나_적금',
            'producttype': '적금',
            'description': '아이 꿈하나 적금 상품 가입을 위한 기본 신청서',
            'formschema': json.dumps({
                'fields': [
                    {'id': 'customer_name', 'name': 'customerName', 'type': 'text', 'label': '고객명', 'required': True, 'placeholder': '고객명을 입력하세요'},
                    {'id': 'resident_number', 'name': 'residentNumber', 'type': 'text', 'label': '주민등록번호', 'required': True, 'placeholder': '주민등록번호를 입력하세요'},
                    {'id': 'phone_number', 'name': 'phoneNumber', 'type': 'text', 'label': '연락처', 'required': True, 'placeholder': '연락처를 입력하세요'},
                    {'id': 'address', 'name': 'address', 'type': 'text', 'label': '주소', 'required': True, 'placeholder': '주소를 입력하세요'},
                    {'id': 'monthly_amount', 'name': 'monthlyAmount', 'type': 'number', 'label': '월 적금 금액', 'required': True, 'placeholder': '월 적금 금액을 입력하세요'},
                    {'id': 'deposit_period', 'name': 'depositPeriod', 'type': 'select', 'label': '적금 기간', 'required': True, 'options': ['12개월', '24개월', '36개월', '48개월', '60개월']},
                    {'id': 'account_number', 'name': 'accountNumber', 'type': 'text', 'label': '입금계좌번호', 'required': True, 'placeholder': '입금계좌번호를 입력하세요'}
                ]
            }, ensure_ascii=False),
            'formtemplatepath': '/forms/irp-001.pdf',
            'versionnumber': 1.0
        },
        {
            'formid': 'FORM-IRP-002',
            'formname': '아이 꿈하나 적금 자동이체 신청서',
            'formtype': 'deposit',
            'productid': 'P033_아이_꿈하나_적금',
            'producttype': '적금',
            'description': '월 적금 자동이체 설정을 위한 신청서',
            'formschema': json.dumps({
                'fields': [
                    {'id': 'customer_name', 'name': 'customerName', 'type': 'text', 'label': '고객명', 'required': True, 'placeholder': '고객명을 입력하세요'},
                    {'id': 'auto_transfer_date', 'name': 'autoTransferDate', 'type': 'select', 'label': '자동이체일', 'required': True, 'options': ['매월 1일', '매월 15일', '매월 말일']},
                    {'id': 'transfer_amount', 'name': 'transferAmount', 'type': 'number', 'label': '이체금액', 'required': True, 'placeholder': '월 이체금액을 입력하세요'},
                    {'id': 'source_account', 'name': 'sourceAccount', 'type': 'text', 'label': '출금계좌번호', 'required': True, 'placeholder': '출금계좌번호를 입력하세요'}
                ]
            }, ensure_ascii=False),
            'formtemplatepath': '/forms/irp-002.pdf',
            'versionnumber': 1.0
        },
        {
            'formid': 'FORM-IRP-003',
            'formname': '개인신용정보 수집이용동의서',
            'formtype': 'deposit',
            'productid': 'P033_아이_꿈하나_적금',
            'producttype': '적금',
            'description': '개인신용정보 수집 및 이용에 대한 동의서',
            'formschema': json.dumps({
                'fields': [
                    {'id': 'customer_name', 'name': 'customerName', 'type': 'text', 'label': '고객명', 'required': True, 'placeholder': '고객명을 입력하세요'},
                    {'id': 'consent_date', 'name': 'consentDate', 'type': 'date', 'label': '동의일자', 'required': True, 'placeholder': '동의일자를 선택하세요'},
                    {'id': 'signature', 'name': 'signature', 'type': 'signature', 'label': '서명', 'required': True, 'placeholder': '서명해주세요'}
                ]
            }, ensure_ascii=False),
            'formtemplatepath': '/forms/irp-003.pdf',
            'versionnumber': 1.0
        },
        {
            'formid': 'FORM-IRP-004',
            'formname': '비과세종합저축 한도확인서',
            'formtype': 'deposit',
            'productid': 'P033_아이_꿈하나_적금',
            'producttype': '적금',
            'description': '비과세종합저축 한도 확인 및 신청서',
            'formschema': json.dumps({
                'fields': [
                    {'id': 'customer_name', 'name': 'customerName', 'type': 'text', 'label': '고객명', 'required': True, 'placeholder': '고객명을 입력하세요'},
                    {'id': 'current_limit', 'name': 'currentLimit', 'type': 'number', 'label': '현재 사용한도', 'required': True, 'placeholder': '현재 사용한도를 입력하세요'},
                    {'id': 'requested_amount', 'name': 'requestedAmount', 'type': 'number', 'label': '신청금액', 'required': True, 'placeholder': '신청금액을 입력하세요'}
                ]
            }, ensure_ascii=False),
            'formtemplatepath': '/forms/irp-004.pdf',
            'versionnumber': 1.0
        },
        {
            'formid': 'FORM-IRP-005',
            'formname': '아이 꿈하나 적금 해지신청서',
            'formtype': 'deposit',
            'productid': 'P033_아이_꿈하나_적금',
            'producttype': '적금',
            'description': '적금 중도해지를 위한 신청서',
            'formschema': json.dumps({
                'fields': [
                    {'id': 'customer_name', 'name': 'customerName', 'type': 'text', 'label': '고객명', 'required': True, 'placeholder': '고객명을 입력하세요'},
                    {'id': 'account_number', 'name': 'accountNumber', 'type': 'text', 'label': '적금계좌번호', 'required': True, 'placeholder': '해지할 적금계좌번호를 입력하세요'},
                    {'id': 'withdrawal_amount', 'name': 'withdrawalAmount', 'type': 'number', 'label': '해지금액', 'required': True, 'placeholder': '해지금액을 입력하세요'},
                    {'id': 'withdrawal_reason', 'name': 'withdrawalReason', 'type': 'select', 'label': '해지사유', 'required': True, 'options': ['자금 필요', '다른 상품 가입', '만기 전 해지', '기타']}
                ]
            }, ensure_ascii=False),
            'formtemplatepath': '/forms/irp-005.pdf',
            'versionnumber': 1.0
        }
    ]
    
    try:
        # 데이터베이스 연결
        print("🔌 Supabase에 연결 중...")
        conn = psycopg2.connect(**DB_CONFIG)
        cursor = conn.cursor()
        
        print("✅ 데이터베이스 연결 성공!")
        
        # 기존 서식 확인
        cursor.execute("SELECT COUNT(*) FROM eform WHERE productid = %s", ('P033_아이_꿈하나_적금',))
        existing_count = cursor.fetchone()[0]
        print(f"🔍 기존 서식 개수: {existing_count}")
        
        if existing_count > 0:
            print("⚠️  이미 서식이 존재합니다. 기존 서식을 삭제하고 새로 추가합니다.")
            cursor.execute("DELETE FROM eform WHERE productid = %s", ('P033_아이_꿈하나_적금',))
            print(f"🗑️  기존 서식 {existing_count}개 삭제 완료")
        
        # 새 서식 추가
        print("📝 새 서식 추가 중...")
        for form in forms_data:
            cursor.execute("""
                INSERT INTO eform (formid, formname, formtype, productid, producttype, description, formschema, formtemplatepath, versionnumber)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            """, (
                form['formid'], form['formname'], form['formtype'], form['productid'],
                form['producttype'], form['description'], form['formschema'],
                form['formtemplatepath'], form['versionnumber']
            ))
            print(f"✅ {form['formname']} 추가 완료")
        
        # 변경사항 커밋
        conn.commit()
        print("💾 변경사항 저장 완료!")
        
        # 추가된 서식 확인
        cursor.execute("SELECT formid, formname FROM eform WHERE productid = %s", ('P033_아이_꿈하나_적금',))
        added_forms = cursor.fetchall()
        print(f"\n🎉 총 {len(added_forms)}개 서식 추가 완료:")
        for form in added_forms:
            print(f"  - {form[0]}: {form[1]}")
        
    except Exception as e:
        print(f"❌ 오류 발생: {e}")
        if 'conn' in locals():
            conn.rollback()
    finally:
        if 'cursor' in locals():
            cursor.close()
        if 'conn' in locals():
            conn.close()
        print("🔌 데이터베이스 연결 종료")

if __name__ == "__main__":
    add_irp_forms()

